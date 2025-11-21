interface ClassData {
  id: string;
  name: string;
  total_lessons: number;
  phone_number: string;
  completed_lessons?: number;
}

interface ClassListProps {
  classes: ClassData[];
  selectedClass: ClassData | null;
  onSelectClass: (classData: ClassData) => void;
}

export default function ClassList({ classes, selectedClass, onSelectClass }: ClassListProps) {
  if (classes.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
        <p className="text-gray-500">Henüz sınıf eklenmemiş</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700">Sınıflar</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {classes.map((classData) => {
          const progress = ((classData.completed_lessons || 0) / classData.total_lessons) * 100;
          const isCompleted = (classData.completed_lessons || 0) >= classData.total_lessons;
          const isSelected = selectedClass?.id === classData.id;

          return (
            <button
              key={classData.id}
              onClick={() => onSelectClass(classData)}
              className={`w-full px-4 py-4 text-left transition-colors ${
                isSelected
                  ? 'bg-blue-50 border-l-4 border-blue-600'
                  : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{classData.name}</h4>
                {isCompleted && (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    Tamamlandı
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {classData.completed_lessons || 0} / {classData.total_lessons} ders
                  </span>
                  <span className="text-xs">{Math.round(progress)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
