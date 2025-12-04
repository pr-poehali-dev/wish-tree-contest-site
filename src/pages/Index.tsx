import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ChristmasTree from '@/components/wishes/ChristmasTree';
import WishDialogs from '@/components/wishes/WishDialogs';
import { Wish, CATEGORIES, COLORS, API_URL, WISHES_PER_PAGE } from '@/components/wishes/types';

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

      <ChristmasTree
        currentWishes={currentWishes}
        fulfilledCount={fulfilledCount}
        totalPages={totalPages}
        currentPage={currentPage}
        onWishClick={setSelectedWish}
        onPageChange={setCurrentPage}
      />

      <WishDialogs
        selectedWish={selectedWish}
        showFulfillDialog={showFulfillDialog}
        showAddForm={showAddForm}
        showPasswordDialog={showPasswordDialog}
        showAdminPanel={showAdminPanel}
        fulfillData={fulfillData}
        newWish={newWish}
        adminPassword={adminPassword}
        wishes={wishes}
        onCloseWishDialog={() => setSelectedWish(null)}
        onOpenFulfillDialog={() => setShowFulfillDialog(true)}
        onCloseFulfillDialog={() => setShowFulfillDialog(false)}
        onFulfillDataChange={setFulfillData}
        onFulfillWish={handleFulfillWish}
        onCloseAddForm={() => setShowAddForm(false)}
        onNewWishChange={setNewWish}
        onOpenPasswordDialog={() => setShowPasswordDialog(true)}
        onClosePasswordDialog={() => setShowPasswordDialog(false)}
        onAdminPasswordChange={setAdminPassword}
        onAddWish={handleAddWish}
        onCloseAdminPanel={() => setShowAdminPanel(false)}
        onResetFulfilled={handleResetFulfilled}
        onDeleteWish={handleDeleteWish}
      />
    </div>
  );
}
