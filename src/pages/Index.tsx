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

export default function Index() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('Все');
  const [adminPassword, setAdminPassword] = useState('');
  const [fulfillData, setFulfillData] = useState({ name: '', contact: '' });
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

  const filteredWishes =
    filterCategory === 'Все'
      ? wishes
      : wishes.filter((w) => w.category === filterCategory);

  const availableWishes = filteredWishes.filter((w) => w.status === 'available');

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
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] animate-fade-in mb-2">
          Ёлка Желаний
        </h1>
        <p className="text-white/80 text-lg">
          Нажми на шарик, чтобы узнать желание ребёнка ✨
        </p>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 mb-8 flex flex-wrap gap-4 justify-between items-center">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
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

        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5] text-white"
        >
          <Icon name="Plus" size={20} className="mr-2" />
          Добавить желание
        </Button>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-20">
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
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: COLORS[i % COLORS.length],
                    left: `${20 + Math.random() * 60}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}`,
                  }}
                />
              ))}
            </div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <Icon
                name="Star"
                size={48}
                className="text-[#FFD700] fill-[#FFD700] animate-pulse"
                style={{ filter: 'drop-shadow(0 0 15px #FFD700)' }}
              />
            </div>
          </div>

          {availableWishes.map((wish) => (
            <button
              key={wish.id}
              onClick={() => setSelectedWish(wish)}
              className="absolute w-16 h-16 rounded-full cursor-pointer transform hover:scale-110 transition-all duration-300 animate-fade-in hover-scale"
              style={{
                left: `${wish.position.x}%`,
                top: `${wish.position.y}%`,
                backgroundColor: wish.color,
                boxShadow: `0 0 20px ${wish.color}, inset 0 -8px 15px rgba(0,0,0,0.2)`,
                background: `radial-gradient(circle at 30% 30%, ${wish.color}, ${wish.color}dd)`,
              }}
            >
              <div
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/40"
                style={{ filter: 'blur(4px)' }}
              />
            </button>
          ))}
        </div>

        <div className="text-center mt-8 space-y-2">
          <Badge className="bg-white/10 text-white border-white/20 text-lg px-6 py-2">
            <Icon name="Gift" size={20} className="mr-2" />
            Доступно желаний: {availableWishes.length}
          </Badge>
          <div className="text-white/60 text-sm">
            Исполнено: {wishes.filter((w) => w.status === 'fulfilled').length}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedWish} onOpenChange={() => setSelectedWish(null)}>
        <DialogContent className="bg-gradient-to-br from-[#2a2f4a] to-[#1a1f3a] border-[#9b87f5]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#FFD700] flex items-center gap-2">
              <Icon name="Sparkles" size={24} />
              Желание {selectedWish?.childName}
            </DialogTitle>
          </DialogHeader>
          {selectedWish && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <Badge className="bg-[#9b87f5] text-white">
                  {selectedWish.age} лет
                </Badge>
                <Badge className="bg-white/10 text-white">
                  {selectedWish.category}
                </Badge>
              </div>
              <Card className="p-6 bg-white/5 border-white/10">
                <p className="text-lg leading-relaxed">{selectedWish.wish}</p>
              </Card>
              <Button
                onClick={() => {
                  setShowFulfillDialog(true);
                  setSelectedWish(selectedWish);
                }}
                className="w-full bg-gradient-to-r from-[#FF6B9D] to-[#F38181] hover:from-[#FF5B8D] hover:to-[#E37171] text-white"
              >
                <Icon name="Heart" size={20} className="mr-2" />
                Я хочу исполнить это желание!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="bg-gradient-to-br from-[#2a2f4a] to-[#1a1f3a] border-[#9b87f5]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#FFD700] flex items-center gap-2">
              <Icon name="Sparkles" size={24} />
              Добавить новое желание
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Имя ребёнка
              </label>
              <Input
                value={newWish.childName}
                onChange={(e) =>
                  setNewWish({ ...newWish, childName: e.target.value })
                }
                placeholder="Введите имя"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Возраст
              </label>
              <Input
                type="number"
                value={newWish.age}
                onChange={(e) =>
                  setNewWish({ ...newWish, age: e.target.value })
                }
                placeholder="Возраст"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Категория
              </label>
              <Select
                value={newWish.category}
                onValueChange={(value) =>
                  setNewWish({ ...newWish, category: value })
                }
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
              <label className="text-sm text-white/70 mb-2 block">
                Желание
              </label>
              <Textarea
                value={newWish.wish}
                onChange={(e) =>
                  setNewWish({ ...newWish, wish: e.target.value })
                }
                placeholder="Опишите желание ребёнка..."
                className="bg-white/10 border-white/20 text-white min-h-24 placeholder:text-white/40"
              />
            </div>
            <Button
              onClick={() => setShowPasswordDialog(true)}
              className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5] text-white"
            >
              <Icon name="Sparkles" size={20} className="mr-2" />
              Далее
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gradient-to-br from-[#2a2f4a] to-[#1a1f3a] border-[#9b87f5]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#FFD700] flex items-center gap-2">
              <Icon name="Lock" size={24} />
              Пароль администратора
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Введите пароль для добавления желания на ёлку
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Введите пароль"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddWish();
                }
              }}
            />
            <Button
              onClick={handleAddWish}
              className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5] text-white"
            >
              Повесить шарик на ёлку
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFulfillDialog} onOpenChange={setShowFulfillDialog}>
        <DialogContent className="bg-gradient-to-br from-[#2a2f4a] to-[#1a1f3a] border-[#9b87f5]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#FFD700] flex items-center gap-2">
              <Icon name="Heart" size={24} />
              Исполнить желание
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Укажите ваши контакты, чтобы мы могли связаться с вами
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Ваше имя
              </label>
              <Input
                value={fulfillData.name}
                onChange={(e) =>
                  setFulfillData({ ...fulfillData, name: e.target.value })
                }
                placeholder="Как к вам обращаться?"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                Контакт (телефон или email)
              </label>
              <Input
                value={fulfillData.contact}
                onChange={(e) =>
                  setFulfillData({ ...fulfillData, contact: e.target.value })
                }
                placeholder="+7 или email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Button
              onClick={handleFulfillWish}
              className="w-full bg-gradient-to-r from-[#FF6B9D] to-[#F38181] hover:from-[#FF5B8D] hover:to-[#E37171] text-white"
            >
              <Icon name="Sparkles" size={20} className="mr-2" />
              Подтвердить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
