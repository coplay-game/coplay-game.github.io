import React, { useState } from 'react';
import { Play, Sparkles, Trophy, Shuffle, Trash2, HelpCircle, Users, Settings2 } from 'lucide-react';
import { GameId, GameMeta, GameRecord, PlayerProfile } from '../types';
import { ANIMAL_AVATARS, getRandomPlayerPair } from '../utils/storage';
import { playPop } from '../utils/audio';

export const GAME_CATALOG: GameMeta[] = [
  {
    id: 'air-hockey',
    title: 'Khúc Côn Cầu Thú Cưng',
    subtitle: 'Đẩy bóng tròn & ghi bàn phản xạ',
    description: 'Mỗi người điều khiển một linh thú để đẩy bóng vào khung thành đối phương. Cẩn thận các chướng ngại nấm nảy bóng!',
    tag: 'Đối Kháng 2P',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
    iconName: 'hockey',
    coverEmoji: '🏒',
    bgColor: 'from-amber-400/20 to-orange-400/20',
    borderColor: 'border-amber-300 hover:border-amber-400',
    isCoop: false,
  },
  {
    id: 'train-coop',
    title: 'Nối Ray Đoàn Tàu Co-op',
    subtitle: 'Hợp tác Bố & Con cùng xây đường ray',
    description: 'Đoàn tàu thú cưng sắp chạy qua! Hai bố con cùng nhanh tay chọn đúng các mảnh đường ray còn thiếu để đoàn tàu về đích an toàn.',
    tag: 'Đồng Đội Co-op',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    iconName: 'train',
    coverEmoji: '🚂',
    bgColor: 'from-emerald-400/20 to-teal-400/20',
    borderColor: 'border-emerald-300 hover:border-emerald-400',
    isCoop: true,
  },
  {
    id: 'farm-race',
    title: 'Đua Xe Nông Trại & Đếm Số',
    subtitle: 'Thu hoạch quả ngọt để xe tăng tốc',
    description: 'Hoàn thành nhiệm vụ thu hoạch đúng loại và số lượng hoa quả (dâu tây, cà rốt, táo ngọt) để chiếc xe đua của mình cán đích trước!',
    tag: 'Học Đếm & Nhanh Tay',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    iconName: 'apple',
    coverEmoji: '🍎',
    bgColor: 'from-rose-400/20 to-pink-400/20',
    borderColor: 'border-rose-300 hover:border-rose-400',
    isCoop: false,
  },
  {
    id: 'candy-monster',
    title: 'Bắt Quái Vật & Đại Boss',
    subtitle: 'Phản xạ bắt kẹo ngọt & cùng hạ Boss',
    description: 'Chạm nhanh vào các quái vật kẹo ngọt thò lên từ các hố kẹo. Khi Đại Boss Kẹo Khổng Lồ xuất hiện, hai bố con cùng hợp lực đập Boss!',
    tag: 'Phản Xạ & Boss Battle',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    iconName: 'monster',
    coverEmoji: '⚡',
    bgColor: 'from-purple-400/20 to-indigo-400/20',
    borderColor: 'border-purple-300 hover:border-purple-400',
    isCoop: false,
  },
  {
    id: 'spot-match',
    title: 'Tìm Hình Giống Nhau (Dobble)',
    subtitle: 'Đĩa tròn xoay 180° - Tìm đúng 1 icon trùng',
    description: 'Trò chơi kinh điển: giữa 2 đĩa tròn chỉ có đúng 1 hình giống nhau. Bé nào bấm trúng trước được điểm, bấm sai bị khóa đếm ngược!',
    tag: 'Tinh Mắt & Tập Trung',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    iconName: 'search',
    coverEmoji: '🔍',
    bgColor: 'from-blue-400/20 to-cyan-400/20',
    borderColor: 'border-blue-300 hover:border-blue-400',
    isCoop: false,
  },
];

interface PortalHomeProps {
  player1: PlayerProfile;
  player2: PlayerProfile;
  onUpdatePlayer1: (p: PlayerProfile) => void;
  onUpdatePlayer2: (p: PlayerProfile) => void;
  onSelectGame: (gameId: GameId, options?: { initialLevel?: number; fixedDifficultyMode?: boolean }) => void;
  history: GameRecord[];
  onClearHistory: () => void;
  onOpenRules: () => void;
}

export const PortalHome: React.FC<PortalHomeProps> = ({
  player1,
  player2,
  onUpdatePlayer1,
  onUpdatePlayer2,
  onSelectGame,
  history,
  onClearHistory,
  onOpenRules,
}) => {
  // Spot match optional pre-configuration
  const [spotLevel, setSpotLevel] = useState(1);
  const [spotFixedMode, setSpotFixedMode] = useState(false);
  const [showSpotConfig, setShowSpotConfig] = useState(false);

  // Randomize avatars & names
  const handleRandomizePlayers = () => {
    playPop();
    const newPair = getRandomPlayerPair();
    onUpdatePlayer1(newPair.p1);
    onUpdatePlayer2(newPair.p2);
  };

  const handleStartGame = (game: GameMeta) => {
    playPop();
    if (game.id === 'spot-match' && showSpotConfig) {
      onSelectGame('spot-match', { initialLevel: spotLevel, fixedDifficultyMode: spotFixedMode });
    } else {
      onSelectGame(game.id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cổng Trò Chơi Gắn Kết Gia Đình</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-1.5">
            Bố Con Cùng Chơi Đối Diện
          </h2>
          <p className="text-xs sm:text-sm text-white/90 font-medium">
            Đặt điện thoại hoặc máy tính bảng ở giữa. Màn hình tự động chia đôi 180° để hai người ngồi đối diện nhau cùng cười vui!
          </p>
        </div>

        <span className="absolute right-4 bottom-2 text-7xl sm:text-8xl opacity-30 select-none pointer-events-none">
          🎮
        </span>
      </div>

      {/* Players Setup Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">Nhân Vật Hai Người Chơi</h3>
          </div>

          <button
            onClick={handleRandomizePlayers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 active:scale-95 transition"
            title="Đổi linh thú ngẫu nhiên"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Đổi Linh Thú
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Player 1 Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/60 border border-rose-200">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-rose-200 flex items-center justify-center text-3xl">
              {player1.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-rose-600 block uppercase tracking-wider">
                Nửa dưới màn hình
              </span>
              <input
                type="text"
                value={player1.name}
                onChange={e => onUpdatePlayer1({ ...player1, name: e.target.value })}
                className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none focus:border-b border-rose-400"
                placeholder="Tên bé..."
              />
              <span className="text-xs text-slate-500 font-medium">{player1.animal}</span>
            </div>
          </div>

          {/* Player 2 Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-200">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-blue-200 flex items-center justify-center text-3xl">
              {player2.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-blue-600 block uppercase tracking-wider">
                Nửa trên (Xoay 180°)
              </span>
              <input
                type="text"
                value={player2.name}
                onChange={e => onUpdatePlayer2({ ...player2, name: e.target.value })}
                className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none focus:border-b border-blue-400"
                placeholder="Tên bố/mẹ..."
              />
              <span className="text-xs text-slate-500 font-medium">{player2.animal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <span>Chọn Trò Chơi</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              5 Trò Chơi
            </span>
          </h3>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
          >
            <HelpCircle className="w-4 h-4" />
            Luật Chơi
          </button>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GAME_CATALOG.map(game => (
            <div
              key={game.id}
              className={`relative bg-gradient-to-br ${game.bgColor} bg-white rounded-3xl p-5 border-2 ${game.borderColor} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-4xl">{game.coverEmoji}</span>
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${game.badgeColor}`}>
                    {game.tag}
                  </span>
                </div>

                <h4 className="text-lg font-black text-slate-800 mb-0.5">{game.title}</h4>
                <p className="text-xs font-bold text-slate-600 mb-2">{game.subtitle}</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{game.description}</p>
              </div>

              {/* Spot match special config toggle */}
              {game.id === 'spot-match' && (
                <div className="mb-3 bg-white/80 p-3 rounded-2xl border border-blue-200">
                  <button
                    onClick={() => setShowSpotConfig(!showSpotConfig)}
                    className="w-full flex items-center justify-between text-xs font-bold text-blue-700 hover:text-blue-900"
                  >
                    <span className="flex items-center gap-1">
                      <Settings2 className="w-3.5 h-3.5" />
                      Tùy chỉnh vòng chơi & độ khó
                    </span>
                    <span>{showSpotConfig ? 'Thu gọn ▲' : 'Mở rộng ▼'}</span>
                  </button>

                  {showSpotConfig && (
                    <div className="mt-2 pt-2 border-t border-blue-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Vòng bắt đầu:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSpotLevel(Math.max(1, spotLevel - 1))}
                            className="w-6 h-6 rounded-lg bg-blue-100 font-bold text-blue-800 hover:bg-blue-200"
                          >
                            -
                          </button>
                          <span className="font-black text-blue-900 w-6 text-center">{spotLevel}</span>
                          <button
                            onClick={() => setSpotLevel(Math.min(15, spotLevel + 1))}
                            className="w-6 h-6 rounded-lg bg-blue-100 font-bold text-blue-800 hover:bg-blue-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <label className="flex items-center justify-between text-xs cursor-pointer">
                        <span className="text-slate-600 font-medium">Giữ nguyên độ khó (chạm 5 thắng):</span>
                        <input
                          type="checkbox"
                          checked={spotFixedMode}
                          onChange={e => setSpotFixedMode(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded-sm"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => handleStartGame(game)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                Chơi Ngay
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* History & Previous Matches */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs mt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">Lịch Sử Các Ván Đã Chơi</h3>
            <span className="text-xs text-slate-400">({history.length} ván)</span>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition"
              title="Xóa lịch sử"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa lịch sử
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-medium">
            Chưa có ván đấu nào được ghi lại. Hãy chọn một game ở trên và bắt đầu chơi cùng con nhé!
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {history.map(rec => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{rec.winnerAvatar}</span>
                  <div>
                    <span className="font-bold text-slate-800 block">{rec.gameTitle}</span>
                    <span className="text-[11px] text-slate-500">
                      {rec.winner === 'coop-win'
                        ? '🤝 Cả hai cùng thắng!'
                        : rec.winner === 'draw'
                        ? 'Hòa nhau'
                        : `Thắng: ${rec.winnerName}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-black text-sm text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    <span className="text-rose-500">{rec.scoreP1}</span>
                    <span className="text-slate-400 mx-1">-</span>
                    <span className="text-blue-500">{rec.scoreP2}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">{rec.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
