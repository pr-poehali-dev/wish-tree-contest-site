import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления желаниями на ёлке: получение списка, добавление, бронирование
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            cur.execute('''
                SELECT id, child_name, age, wish, category, color, 
                       position_x, position_y, status, fulfilled_by, created_at
                FROM wishes 
                ORDER BY created_at DESC
            ''')
            wishes = cur.fetchall()
            
            wishes_list = []
            for wish in wishes:
                wishes_list.append({
                    'id': wish['id'],
                    'childName': wish['child_name'],
                    'age': wish['age'],
                    'wish': wish['wish'],
                    'category': wish['category'],
                    'color': wish['color'],
                    'position': {
                        'x': float(wish['position_x']),
                        'y': float(wish['position_y'])
                    },
                    'status': wish['status'],
                    'fulfilledBy': wish['fulfilled_by']
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'wishes': wishes_list}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            admin_password = event.get('headers', {}).get('x-admin-password') or event.get('headers', {}).get('X-Admin-Password')
            expected_password = os.environ.get('ADMIN_PASSWORD')
            
            if not admin_password or admin_password != expected_password:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный пароль администратора'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute('''
                INSERT INTO wishes (child_name, age, wish, category, color, position_x, position_y)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data['childName'],
                body_data['age'],
                body_data['wish'],
                body_data['category'],
                body_data['color'],
                body_data['position']['x'],
                body_data['position']['y']
            ))
            
            new_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'id': new_id, 'message': 'Желание добавлено'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'fulfill':
                wish_id = body_data.get('id')
                cur.execute('''
                    UPDATE wishes 
                    SET status = 'fulfilled', 
                        fulfilled_by = %s,
                        fulfilled_contact = %s
                    WHERE id = %s AND status = 'available'
                    RETURNING id
                ''', (
                    body_data.get('fulfilledBy'),
                    body_data.get('contact'),
                    wish_id
                ))
                
                result = cur.fetchone()
                conn.commit()
                
                if result:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'message': 'Желание забронировано'}),
                        'isBase64Encoded': False
                    }
                else:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 409,
                        'headers': headers,
                        'body': json.dumps({'error': 'Желание уже забронировано'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'reset_fulfilled':
                admin_password = event.get('headers', {}).get('x-admin-password') or event.get('headers', {}).get('X-Admin-Password')
                expected_password = os.environ.get('ADMIN_PASSWORD')
                
                if not admin_password or admin_password != expected_password:
                    return {
                        'statusCode': 403,
                        'headers': headers,
                        'body': json.dumps({'error': 'Неверный пароль администратора'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    UPDATE wishes 
                    SET status = 'available', 
                        fulfilled_by = NULL,
                        fulfilled_contact = NULL
                    WHERE status = 'fulfilled'
                ''')
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Выполненные желания обнулены'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            admin_password = event.get('headers', {}).get('x-admin-password') or event.get('headers', {}).get('X-Admin-Password')
            expected_password = os.environ.get('ADMIN_PASSWORD')
            
            if not admin_password or admin_password != expected_password:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неверный пароль администратора'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            wish_id = body_data.get('id')
            
            cur.execute('DELETE FROM wishes WHERE id = %s', (wish_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Желание удалено'}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }