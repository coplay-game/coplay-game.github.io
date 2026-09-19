import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { GAME_CATALOG } from './PortalHome';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-4 border-amber-200 flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-slate-800">Hướng Dẫn & Luật Chơi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex flex-col gap-3 text-xs text-slate-600">
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <h4 className="font-bold text-amber-900 mb-1">📐 Cách bố trí khi chơi 2 người:</h4>
            <p>
              Đặt điện thoại hoặc máy tính bảng ở giữa bàn. Màn hình tự động chia làm 2 nửa: nửa trên xoay 180° để người ngồi đối diện nhìn thuận chiều; nửa dưới cho người ngồi bên này. Có thể bấm nút <b>180°/0°</b> ở thanh trên nếu hai người ngồi cạnh nhau!
            </p>
          </div>

          {GAME_CATALOG.map(game => (
            <div key={game.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-black text-slate-800 text-sm mb-1">
                <span>{game.coverEmoji}</span>
                <span>{game.title}</span>
              </div>
              <p className="leading-relaxed">{game.description}</p>
              <div className="mt-1.5 text-[11px] font-semibold text-slate-500">
                {game.id === 'air-hockey' && '👉 Ai ghi được 5 bàn trước sẽ giành cúp vàng!'}
                {game.id === 'train-coop' && '👉 Cả 2 cùng hợp tác nối ray để đoàn tàu đi qua 3 chặng đồi núi.'}
                {game.id === 'farm-race' && '👉 Thu hoạch đủ số quả theo yêu cầu để xe về đích, thắng 3 chặng là vô địch.'}
                {game.id === 'candy-monster' && '👉 Đập quái vật kẹo +1 điểm, né ong chích kẻo đóng băng 2s. Cùng đập Boss khi Boss xuất hiện!'}
                {game.id === 'spot-match' && '👉 Tìm duy nhất 1 icon giống nhau giữa 2 đĩa tròn. Bấm sai bị khóa đếm ngược (2s, 3s, 4s...).'}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
        >
          Đã Hiểu, Cùng Chơi Thôi!
        </button>
      </div>
    </div>
  );
};
