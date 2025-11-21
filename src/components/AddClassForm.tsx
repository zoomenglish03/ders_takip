import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus } from 'lucide-react';

interface AddClassFormProps {
  onClassAdded: () => void;
}

export default function AddClassForm({ onClassAdded }: AddClassFormProps) {
  const [name, setName] = useState('');
  const [totalLessons, setTotalLessons] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !totalLessons || !phoneNumber) {
      alert('Tüm alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('classes').insert({
        name,
        total_lessons: parseInt(totalLessons),
        phone_number: phoneNumber,
      });

      if (error) throw error;

      setName('');
      setTotalLessons('');
      setPhoneNumber('');
      onClassAdded();
    } catch (error) {
      console.error('Sınıf eklenemedi:', error);
      alert('Sınıf eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
        <h3 className="font-semibold text-white">Yeni Sınıf Ekle</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sınıf Adı
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="örn: 10-A"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Toplam Ders Sayısı
          </label>
          <input
            type="number"
            value={totalLessons}
            onChange={(e) => setTotalLessons(e.target.value)}
            placeholder="örn: 40"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp Telefon Numarası
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="örn: +905551234567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Sınıf Ekle</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
