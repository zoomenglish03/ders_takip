import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import ClassList from './components/ClassList';
import AddClassForm from './components/AddClassForm';
import LessonTracker from './components/LessonTracker';
import NotificationHistory from './components/NotificationHistory';
import { setupDatabase } from './lib/setupDatabase';
import { BookOpen, Bell } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  total_lessons: number;
  phone_number: string;
  completed_lessons?: number;
}

function App() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [activeTab, setActiveTab] = useState<'lessons' | 'notifications'>('lessons');
  const [loading, setLoading] = useState(true);
  const [dbSetup, setDbSetup] = useState(false);

  useEffect(() => {
    const initDatabase = async () => {
      const result = await setupDatabase();
      setDbSetup(result.success);
      if (result.success) {
        loadClasses();
      }
    };
    initDatabase();
  }, []);

  const loadClasses = async () => {
    try {
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (classesError) throw classesError;

      const classesWithLessons = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          return {
            ...cls,
            completed_lessons: count || 0,
          };
        })
      );

      setClasses(classesWithLessons);
    } catch (error) {
      console.error('Sınıflar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassAdded = () => {
    loadClasses();
  };

  const handleLessonAdded = () => {
    loadClasses();
    if (selectedClass) {
      const updatedClass = classes.find((c) => c.id === selectedClass.id);
      if (updatedClass) {
        setSelectedClass(updatedClass);
      }
    }
  };

  if (!dbSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Veritabanı hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-white" />
              <h1 className="text-3xl font-bold text-white">
                Ders Yönetim ve Raporlama Sistemi
              </h1>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <AddClassForm onClassAdded={handleClassAdded} />
                <ClassList
                  classes={classes}
                  selectedClass={selectedClass}
                  onSelectClass={setSelectedClass}
                />
              </div>

              <div className="lg:col-span-2">
                {selectedClass ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
                      <h2 className="text-2xl font-bold mb-2">{selectedClass.name}</h2>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-blue-100 text-sm">İşlenen Ders</p>
                          <p className="text-3xl font-bold">
                            {selectedClass.completed_lessons || 0}
                          </p>
                        </div>
                        <div className="text-4xl text-white/30">/</div>
                        <div>
                          <p className="text-blue-100 text-sm">Toplam Ders</p>
                          <p className="text-3xl font-bold">{selectedClass.total_lessons}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-white h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                ((selectedClass.completed_lessons || 0) /
                                  selectedClass.total_lessons) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-blue-100 mt-2">
                          {Math.round(
                            ((selectedClass.completed_lessons || 0) /
                              selectedClass.total_lessons) *
                              100
                          )}
                          % tamamlandı
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex border-b border-gray-200">
                        <button
                          onClick={() => setActiveTab('lessons')}
                          className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                            activeTab === 'lessons'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            <span>Dersler</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('notifications')}
                          className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                            activeTab === 'notifications'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Bell className="w-5 h-5" />
                            <span>Bildirimler</span>
                          </div>
                        </button>
                      </div>

                      <div className="p-6">
                        {activeTab === 'lessons' ? (
                          <LessonTracker
                            classData={selectedClass}
                            onLessonAdded={handleLessonAdded}
                          />
                        ) : (
                          <NotificationHistory classId={selectedClass.id} />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                    <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Sınıf Seçin
                    </h3>
                    <p className="text-gray-500">
                      Ders takibi yapmak için sol taraftan bir sınıf seçin
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
