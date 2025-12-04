import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
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
import { Wish, CATEGORIES } from './types';

interface WishDialogsProps {
  selectedWish: Wish | null;
  showFulfillDialog: boolean;
  showAddForm: boolean;
  showPasswordDialog: boolean;
  showAdminPanel: boolean;
  fulfillData: { name: string; contact: string };
  newWish: { childName: string; age: string; wish: string; category: string };
  adminPassword: string;
  wishes: Wish[];
  onCloseWishDialog: () => void;
  onOpenFulfillDialog: () => void;
  onCloseFulfillDialog: () => void;
  onFulfillDataChange: (data: { name: string; contact: string }) => void;
  onFulfillWish: () => void;
  onCloseAddForm: () => void;
  onNewWishChange: (wish: { childName: string; age: string; wish: string; category: string }) => void;
  onOpenPasswordDialog: () => void;
  onClosePasswordDialog: () => void;
  onAdminPasswordChange: (password: string) => void;
  onAddWish: () => void;
  onCloseAdminPanel: () => void;
  onResetFulfilled: () => void;
  onDeleteWish: (wishId: number) => void;
}

export default function WishDialogs({
  selectedWish,
  showFulfillDialog,
  showAddForm,
  showPasswordDialog,
  showAdminPanel,
  fulfillData,
  newWish,
  adminPassword,
  wishes,
  onCloseWishDialog,
  onOpenFulfillDialog,
  onCloseFulfillDialog,
  onFulfillDataChange,
  onFulfillWish,
  onCloseAddForm,
  onNewWishChange,
  onOpenPasswordDialog,
  onClosePasswordDialog,
  onAdminPasswordChange,
  onAddWish,
  onCloseAdminPanel,
  onResetFulfilled,
  onDeleteWish,
}: WishDialogsProps) {
  return (
    <>
      <Dialog open={!!selectedWish} onOpenChange={onCloseWishDialog}>
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
                    onOpenFulfillDialog();
                    onCloseWishDialog();
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

      <Dialog open={showFulfillDialog} onOpenChange={onCloseFulfillDialog}>
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
                onChange={(e) => onFulfillDataChange({ ...fulfillData, name: e.target.value })}
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
                  onFulfillDataChange({ ...fulfillData, contact: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white"
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <Button
              onClick={onFulfillWish}
              className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5]"
            >
              Забронировать
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddForm} onOpenChange={onCloseAddForm}>
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
                onChange={(e) => onNewWishChange({ ...newWish, childName: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Возраст</label>
              <Input
                type="number"
                value={newWish.age}
                onChange={(e) => onNewWishChange({ ...newWish, age: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Категория</label>
              <Select
                value={newWish.category}
                onValueChange={(val) => onNewWishChange({ ...newWish, category: val })}
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
                onChange={(e) => onNewWishChange({ ...newWish, wish: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                rows={4}
              />
            </div>
            <Button
              onClick={onOpenPasswordDialog}
              className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5]"
            >
              Далее
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={onClosePasswordDialog}>
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
              onChange={(e) => onAdminPasswordChange(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Введите пароль"
            />
            <Button
              onClick={onAddWish}
              className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5]"
            >
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdminPanel} onOpenChange={onCloseAdminPanel}>
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
                onChange={(e) => onAdminPasswordChange(e.target.value)}
                className="bg-white/10 border-white/20 text-white mb-4"
                placeholder="Введите пароль"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onResetFulfilled}
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
                        onClick={() => onDeleteWish(wish.id)}
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
    </>
  );
}
