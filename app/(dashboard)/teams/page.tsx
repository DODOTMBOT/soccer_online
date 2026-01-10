import Link from "next/link";

// Простой компонент карточки для красоты (можешь вынести потом)
function TeamCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="font-bold text-lg text-slate-800">{name}</div>
      <div className="text-sm text-slate-500">{role}</div>
    </div>
  );
}

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Мои команды</h1>
          <p className="text-slate-500">Управляйте вашими клубами здесь</p>
        </div>
        <Link 
          href="/teams/new" 
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium"
        >
          + Создать команду
        </Link>
      </div>

      {/* Контент (пример) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TeamCard name="FC Barcelona" role="La Liga" />
        <TeamCard name="Real Madrid" role="La Liga" />
        <TeamCard name="Manchester City" role="Premier League" />
      </div>
      
      {/* Здесь будет твоя таблица команд, когда ты её перенесешь */}
    </div>
  );
}