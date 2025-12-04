import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Wish {
  id: number;
  childName: string;
  age: number;
  wish: string;
  category: string;
  position: { x: number; y: number };
  color: string;
  status?: string;
  fulfilledBy?: string;
}

const CATEGORIES = ['Игрушки', 'Книги', 'Спорт', 'Творчество', 'Мечта'];
const COLORS = ['#FFD700', '#FF6B9D', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA'];
const API_URL = 'https://functions.poehali.dev/8990a62f-83d1-4f33-88e1-fa8fcffaea2a';
const WISHES_PER_PAGE = 8;

export default function Index() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('Все');
  const [adminPassword, setAdminPassword] = useState('');
  const [fulfillData, setFulfillData] = useState({ name: '', contact: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();
  
  const [newWish, setNewWish] = useState({
    childName: '',
    age: '',
    wish: '',
    category: 'Игрушки',
  });

  useEffect(() => {
    loadWishes();
  }, []);

  const loadWishes = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setWishes(data.wishes || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить желания',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWish = async () => {
    if (!newWish.childName || !newWish.age || !newWish.wish) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      const wishData = {
        childName: newWish.childName,
        age: parseInt(newWish.age),
        wish: newWish.wish,
        category: newWish.category,
        position: {
          x: 25 + Math.random() * 50,
          y: 20 + Math.random() * 60,
        },
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify(wishData),
      });

      if (response.status === 403) {
        toast({
          title: 'Ошибка',
          description: 'Неверный пароль администратора',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Ошибка при добавлении желания');
      }

      toast({
        title: 'Успех!',
        description: 'Желание добавлено на ёлку',
      });

      setNewWish({ childName: '', age: '', wish: '', category: 'Игрушки' });
      setAdminPassword('');
      setShowPasswordDialog(false);
      setShowAddForm(false);
      loadWishes();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить желание',
        variant: 'destructive',
      });
    }
  };

  const handleFulfillWish = async () => {
    if (!fulfillData.name || !fulfillData.contact) {
      toast({
        title: 'Ошибка',
        description: 'Укажите ваше имя и контакт',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedWish?.id,
          action: 'fulfill',
          fulfilledBy: fulfillData.name,
          contact: fulfillData.contact,
        }),
      });

      if (response.status === 409) {
        toast({
          title: 'Упс!',
          description: 'Это желание уже забронировано кем-то другим',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Ошибка при бронировании');
      }

      toast({
        title: 'Спасибо! ❤️',
        description: 'Вы выбрали желание для исполнения. Скоро с вами свяжутся!',
      });

      setFulfillData({ name: '', contact: '' });
      setShowFulfillDialog(false);
      setSelectedWish(null);
      loadWishes();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось забронировать желание',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWish = async (wishId: number) => {
    if (!confirm('Точно удалить это желание?')) return;

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ id: wishId }),
      });

      if (response.status === 403) {
        toast({
          title: 'Ошибка',
          description: 'Неверный пароль администратора',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Ошибка при удалении');
      }

      toast({
        title: 'Удалено',
        description: 'Желание удалено',
      });

      loadWishes();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить желание',
        variant: 'destructive',
      });
    }
  };

  const handleResetFulfilled = async () => {
    if (!confirm('Обнулить все выполненные желания? Это действие нельзя отменить.')) return;

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          action: 'reset_fulfilled',
        }),
      });

      if (response.status === 403) {
        toast({
          title: 'Ошибка',
          description: 'Неверный пароль администратора',
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Ошибка при обнулении');
      }

      toast({
        title: 'Готово',
        description: 'Выполненные желания обнулены',
      });

      loadWishes();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обнулить желания',
        variant: 'destructive',
      });
    }
  };

  const filteredWishes =
    filterCategory === 'Все'
      ? wishes
      : wishes.filter((w) => w.category === filterCategory);

  const availableWishes = filteredWishes.filter((w) => w.status === 'available');
  const fulfilledCount = wishes.filter((w) => w.status === 'fulfilled').length;
  
  const totalPages = Math.ceil(availableWishes.length / WISHES_PER_PAGE);
  const currentWishes = availableWishes.slice(
    currentPage * WISHES_PER_PAGE,
    (currentPage + 1) * WISHES_PER_PAGE
  );

  const predefinedPositions = [
    { x: 50, y: 18 },
    { x: 38, y: 32 },
    { x: 62, y: 32 },
    { x: 30, y: 48 },
    { x: 50, y: 48 },
    { x: 70, y: 48 },
    { x: 25, y: 68 },
    { x: 75, y: 68 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#2a2f4a] flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка... ✨</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#2a2f4a] overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center pt-12 pb-8">
        <h1 
          className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] animate-fade-in mb-2 cursor-default select-none"
          onClick={() => {
            const newCount = clickCount + 1;
            setClickCount(newCount);
            if (newCount === 5) {
              setIsAdmin(true);
              toast({
                title: 'Режим администратора',
                description: 'Кнопка добавления желаний активирована',
              });
            }
          }}
        >
          Ёлка Желаний
        </h1>
        <p className="text-white/80 text-lg">
          Нажми на шарик, чтобы узнать желание ребёнка ✨
        </p>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 mb-8 flex flex-wrap gap-4 justify-between items-center">
        <Select value={filterCategory} onValueChange={(val) => {
          setFilterCategory(val);
          setCurrentPage(0);
        }}>
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Все">Все категории</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 flex-wrap">
          {isAdmin && (
            <>
              <Button
                onClick={() => setShowAdminPanel(true)}
                className="bg-gradient-to-r from-[#7E69AB] to-[#6E59A5] hover:from-[#6E59A5] hover:to-[#5E4995] text-white"
              >
                <Icon name="Settings" size={20} className="mr-2" />
                Админ-панель
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5] text-white"
              >
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить желание
              </Button>
            </>
          )}
        </div>
      </div>

      {availableWishes.length === 0 ? (
        <div className="relative z-10 max-w-2xl mx-auto px-4 pb-20">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Все желания исполнены!
            </h2>
            <p className="text-white/80 text-xl mb-2">
              Вместе нам удалось выполнить <span className="text-yellow-400 font-bold">{fulfilledCount}</span> {fulfilledCount === 1 ? 'желание' : fulfilledCount < 5 ? 'желания' : 'желаний'}
            </p>
            <p className="text-white/60 text-lg">
              Спасибо всем волонтёрам за доброту! ❤️
            </p>
          </Card>
        </div>
      ) : (
        <>
          <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8">
            <div className="relative w-full h-[600px]">
              <div className="absolute left-1/2 top-0 -translate-x-1/2">
                <div className="relative">
                  <div
                    className="w-0 h-0 border-l-[200px] border-r-[200px] border-b-[500px] border-l-transparent border-r-transparent"
                    style={{
                      borderBottomColor: '#2d5016',
                      filter: 'drop-shadow(0 0 20px rgba(157, 255, 0, 0.3))',
                    }}
                  />
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl animate-pulse z-50"
                    style={{
                      textShadow: '0 0 30px #FFD700, 0 0 50px #FFA500',
                      filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))',
                    }}
                  >
                    ⭐
                  </div>
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full animate-pulse"
                      style={{
                        backgroundColor: COLORS[i % COLORS.length],
                        left: `${50 + (Math.random() - 0.5) * 180}%`,
                        top: `${10 + Math.random() * 80}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {currentWishes.map((wish, index) => {
                const pos = predefinedPositions[index] || { x: 50, y: 50 };
                const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                return (
                  <button
                    key={wish.id}
                    onClick={() => setSelectedWish(wish)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                    }}
                  >
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-[float_3s_ease-in-out_infinite]"
                        style={{
                          backgroundColor: randomColor,
                          boxShadow: `0 0 20px ${randomColor}`,
                          animationDelay: `${index * 0.2}s`,
                        }}
                      />
                      <div
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-gradient-to-b from-transparent via-white/50 to-transparent"
                      />
                      <Badge
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs"
                        style={{
                          backgroundColor: randomColor,
                          color: '#000',
                        }}
                      >
                        {wish.category}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8 flex justify-center items-center gap-4">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Icon name="ChevronLeft" size={20} />
              </Button>
              
              <span className="text-white text-lg">
                Страница {currentPage + 1} из {totalPages}
              </span>
              
              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Icon name="ChevronRight" size={20} />
              </Button>
            </div>
          )}

          {fulfilledCount > 0 && (
            <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8 text-center">
              <p className="text-white/60 text-lg">
                Выполнено желаний: <span className="text-yellow-400 font-bold">{fulfilledCount}</span>
              </p>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selectedWish} onOpenChange={() => setSelectedWish(null)}>
        <DialogContent className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-yellow-400">
              Желание ребёнка
            </DialogTitle>
          </DialogHeader>
          {selectedWish && (
            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm">Имя</p>
                <p className="text-lg font-semibold">{selectedWish.childName}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Возраст</p>
                <p className="text-lg">{selectedWish.age} лет</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Желание</p>
                <p className="text-lg leading-relaxed">{selectedWish.wish}</p>
              </div>
              <div>
                <Badge
                  style={{
                    backgroundColor: selectedWish.color,
                    color: '#000',
                  }}
                >
                  {selectedWish.category}
                </Badge>
              </div>
              {selectedWish.status === 'available' && (
                <Button
                  onClick={() => {
                    setShowFulfillDialog(true);
                    setSelectedWish(null);
                  }}
                  className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5]"
                >
                  Я исполню это желание! ✨
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showFulfillDialog} onOpenChange={setShowFulfillDialog}>
        <DialogContent className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-yellow-400">
              Забронировать желание
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Укажите ваши контакты, чтобы мы могли связаться с вами
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Ваше имя</label>
              <Input
                value={fulfillData.name}
                onChange={(e) => setFulfillData({ ...fulfillData, name: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Иван Иванов"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">
                Телефон или email
              </label>
              <Input
                value={fulfillData.contact}
                onChange={(e) =>
                  setFulfillData({ ...fulfillData, contact: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white"
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <Button
              onClick={handleFulfillWish}
              className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5]"
            >
              Забронировать
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-yellow-400">
              Добавить желание
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Имя ребёнка</label>
              <Input
                value={newWish.childName}
                onChange={(e) => setNewWish({ ...newWish, childName: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Возраст</label>
              <Input
                type="number"
                value={newWish.age}
                onChange={(e) => setNewWish({ ...newWish, age: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Категория</label>
              <Select
                value={newWish.category}
                onValueChange={(val) => setNewWish({ ...newWish, category: val })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Желание</label>
              <Textarea
                value={newWish.wish}
                onChange={(e) => setNewWish({ ...newWish, wish: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                rows={4}
              />
            </div>
            <Button
              onClick={() => setShowPasswordDialog(true)}
              className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5]"
            >
              Далее
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-yellow-400">
              Пароль администратора
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Введите пароль"
            />
            <Button
              onClick={handleAddWish}
              className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5]"
            >
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
        <DialogContent className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-white/20 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-yellow-400">
              Админ-панель
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Пароль администратора</label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white mb-4"
                placeholder="Введите пароль"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleResetFulfilled}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Icon name="RotateCcw" size={20} className="mr-2" />
                Обнулить выполненные
              </Button>
            </div>

            <div className="border-t border-white/20 pt-4">
              <h3 className="text-xl font-semibold mb-4">Все желания ({wishes.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {wishes.map((wish) => (
                  <Card key={wish.id} className="bg-white/10 border-white/20 p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            style={{
                              backgroundColor: wish.color,
                              color: '#000',
                            }}
                          >
                            {wish.category}
                          </Badge>
                          <Badge variant={wish.status === 'fulfilled' ? 'default' : 'outline'}>
                            {wish.status === 'fulfilled' ? '✓ Выполнено' : 'Доступно'}
                          </Badge>
                        </div>
                        <p className="font-semibold">{wish.childName}, {wish.age} лет</p>
                        <p className="text-sm text-white/80 mt-1">{wish.wish}</p>
                        {wish.status === 'fulfilled' && wish.fulfilledBy && (
                          <p className="text-sm text-green-400 mt-2">
                            Волонтёр: {wish.fulfilledBy}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDeleteWish(wish.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}