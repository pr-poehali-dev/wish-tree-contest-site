import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Wish, COLORS } from './types';

interface ChristmasTreeProps {
  currentWishes: Wish[];
  fulfilledCount: number;
  totalPages: number;
  currentPage: number;
  onWishClick: (wish: Wish) => void;
  onPageChange: (page: number) => void;
}

const predefinedPositions = [
  { x: 50, y: 20 },
  { x: 42, y: 35 },
  { x: 58, y: 35 },
  { x: 35, y: 50 },
  { x: 50, y: 50 },
  { x: 65, y: 50 },
  { x: 30, y: 68 },
  { x: 70, y: 68 },
];

export default function ChristmasTree({
  currentWishes,
  fulfilledCount,
  totalPages,
  currentPage,
  onWishClick,
  onPageChange,
}: ChristmasTreeProps) {
  if (currentWishes.length === 0) {
    return (
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
    );
  }

  return (
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
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl animate-pulse z-50 px-0 rounded-0 mx-0 bg-transparent"
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
            const uniqueColor = COLORS[index % COLORS.length];
            return (
              <button
                key={wish.id}
                onClick={() => onWishClick(wish)}
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
                      backgroundColor: uniqueColor,
                      boxShadow: `0 0 20px ${uniqueColor}`,
                      animationDelay: `${index * 0.2}s`,
                    }}
                  />
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-gradient-to-b from-transparent via-white/50 to-transparent"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8 flex justify-center items-center gap-4">
          <Button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Icon name="ChevronLeft" size={20} />
          </Button>
          
          <span className="text-white text-lg">
            Страница {currentPage + 1} из {totalPages}
          </span>
          
          <Button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
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
  );
}