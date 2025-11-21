import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { checkAndNotifyClassCompletion } from '../lib/whatsappService';
import { Calendar, Plus, Trash2 } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  total_lessons: number;
  phone_number: string;
  completed_lessons?: number;
}

interface Lesson {
  id: string;
  lesson_date: string;
  subject: string;
  notes: string;
}

interface LessonTrackerProps {
  classData: ClassData;
  onLessonAdded: () => void;
}

export default function LessonTracker({ classData, onLessonAdded }: LessonTrackerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(true);

  useEffect(() => {
    loadLessons();
  }, [classData.id]);

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('class_id', classData.id)
        .order('lesson_date', { ascending: false });

      if (error) throw error;

      setLessons(data || []);
    } catch (error) {
      console.error('Dersler yüklenemedi:', error);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject) {
      alert('Ders konusu gerekli');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('lessons').insert({
        class_id: classData.id,
        subject,
        notes,
        lesson_date: lessonDate,
      });

      if (error) throw error;

      const newCompletedLessons = (classData.completed_lessons || 0) + 1;

      await checkAndNotifyClassCompletion(
        classData.id,
        classData.name,
        classData.total_lessons,
        classData.phone_number,
        newCompletedLessons
      );

      setSubject('');
      setNotes('');
      setLessonDate(new Date().toISOString().split('T')[0]);
      loadLessons();
      onLessonAdded();
    } catch (error) {
      console.error('Ders eklenemedi:', error);
      alert('Ders eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);

      if (error) throw error;

      loadLessons();
      onLessonAdded();
    } catch (error) {
      console.error('Ders silinemedi:', error);
      alert('Ders silinirken hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddLesson} className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-gray-800 mb-4">Yeni Ders Ekle</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ders Tarihi
          </label>
          <input
            type="date"
            value={lessonDate}
            onChange={(e) => setLessonDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ders Konusu
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="örn: Matematiksel İfadeler"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notlar (İsteğe Bağlı)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ders hakkında notlar..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Ders Ekle</span>
            </>
          )}
        </button>
      </form>

      <div>
        <h4 className="font-semibold text-gray-800 mb-4">İşlenen Dersler</h4>
        {loadingLessons ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Henüz ders eklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {new Date(lesson.lesson_date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h5 className="font-semibold text-gray-800 mb-1">{lesson.subject}</h5>
                    {lesson.notes && (
                      <p className="text-sm text-gray-600 mt-2">{lesson.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
