export type ClubDef = {
  name: string;
  city: string;
  stadium: string;
  logo: string;
  capacity?: number;
  finances?: number;
};

// Структура: { "Название Страны": { "Название Лиги": [Список Клубов] } }
export const REAL_CLUBS_DB: Record<string, Record<string, ClubDef[]>> = {
  "Англия": {
    "Premier League": [
      // --- Premier League (20) ---
      { name: 'Арсенал', city: 'Лондон', stadium: 'Эмирейтс', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png' },
      { name: 'Манчестер Сити', city: 'Манчестер', stadium: 'Этихад', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png' },
      { name: 'Ливерпуль', city: 'Ливерпуль', stadium: 'Энфилд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png' },
      { name: 'Челси', city: 'Лондон', stadium: 'Стэмфорд Бридж', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png' },
      { name: 'Манчестер Юнайтед', city: 'Манчестер', stadium: 'Олд Траффорд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png' },
      { name: 'Тоттенхэм', city: 'Лондон', stadium: 'Тоттенхэм Хотспур', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png' },
      { name: 'Астон Вилла', city: 'Бирмингем', stadium: 'Вилла Парк', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Aston_Villa_FC_crest_%282016%29.svg/1200px-Aston_Villa_FC_crest_%282016%29.svg.png' },
      { name: 'Ньюкасл', city: 'Ньюкасл', stadium: 'Сент-Джеймс Парк', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png' },
      { name: 'Вест Хэм', city: 'Лондон', stadium: 'Лондон Стэдиум', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/1200px-West_Ham_United_FC_logo.svg.png' },
      { name: 'Эвертон', city: 'Ливерпуль', stadium: 'Гудисон Парк', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/1200px-Everton_FC_logo.svg.png' },
      { name: 'Брайтон', city: 'Брайтон', stadium: 'Амекс', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/1200px-Brighton_%26_Hove_Albion_logo.svg.png' },
      { name: 'Брентфорд', city: 'Лондон', stadium: 'Gtech Community', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Brentford_FC_crest.svg/1200px-Brentford_FC_crest.svg.png' },
      { name: 'Вулверхэмптон', city: 'Вулвергемптон', stadium: 'Молинью', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Wolverhampton_Wanderers.svg/1200px-Wolverhampton_Wanderers.svg.png' },
      { name: 'Кристал Пэлас', city: 'Лондон', stadium: 'Селхерст Парк', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Crystal_Palace_FC_logo_%282022%29.svg/1200px-Crystal_Palace_FC_logo_%282022%29.svg.png' },
      { name: 'Борнмут', city: 'Борнмут', stadium: 'Виталити', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/AFC_Bournemouth_%282013%29.svg/1200px-AFC_Bournemouth_%282013%29.svg.png' },
      { name: 'Бернли', city: 'Бернли', stadium: 'Терф Мур', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/62/Burnley_FC_Logo.svg/1200px-Burnley_FC_Logo.svg.png' },
      { name: 'Фулхэм', city: 'Лондон', stadium: 'Крейвен Коттедж', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/1200px-Fulham_FC_%28shield%29.svg.png' },
      { name: 'Ноттингем Форест', city: 'Ноттингем', stadium: 'Сити Граунд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nottingham_Forest_FC_logo.svg/1200px-Nottingham_Forest_FC_logo.svg.png' },
      { name: 'Шеффилд Юнайтед', city: 'Шеффилд', stadium: 'Брэмолл Лейн', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Sheffield_United_FC_logo.svg/1200px-Sheffield_United_FC_logo.svg.png' },
      { name: 'Лутон Таун', city: 'Лутон', stadium: 'Кенилуорт Роуд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Luton_Town_logo.svg/1200px-Luton_Town_logo.svg.png' },

      // --- Championship & Others (32 additional clubs) ---
      { name: 'Лестер Сити', city: 'Лестер', stadium: 'Кинг Пауэр', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Leicester_City_crest.svg/1200px-Leicester_City_crest.svg.png' },
      { name: 'Лидс Юнайтед', city: 'Лидс', stadium: 'Элланд Роуд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Leeds_United_F.C._logo.svg/1200px-Leeds_United_F.C._logo.svg.png' },
      { name: 'Саутгемптон', city: 'Саутгемптон', stadium: 'Сент-Мэрис', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/FC_Southampton.svg/1200px-FC_Southampton.svg.png' },
      { name: 'Ипсвич Таун', city: 'Ипсвич', stadium: 'Портман Роуд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Ipswich_Town.svg/1200px-Ipswich_Town.svg.png' },
      { name: 'Норвич Сити', city: 'Норвич', stadium: 'Кэрроу Роуд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Norwich_City.svg/1200px-Norwich_City.svg.png' },
      { name: 'Вест Бромвич', city: 'Уэст-Бромидж', stadium: 'Хоторнс', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/West_Bromwich_Albion.svg/1200px-West_Bromwich_Albion.svg.png' },
      { name: 'Халл Сити', city: 'Кингстон-апон-Халл', stadium: 'МКМ Стэдиум', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Hull_City_A.F.C._logo.svg/1200px-Hull_City_A.F.C._logo.svg.png' },
      { name: 'Ковентри Сити', city: 'Ковентри', stadium: 'Ковентри Билдинг', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/94/Coventry_City_FC_logo.svg/1200px-Coventry_City_FC_logo.svg.png' },
      { name: 'Мидлсбро', city: 'Мидлсбро', stadium: 'Риверсайд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Middlesbrough_FC_crest.svg/1200px-Middlesbrough_FC_crest.svg.png' },
      { name: 'Престон Норт Энд', city: 'Престон', stadium: 'Дипдейл', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Preston_North_End_FC.svg/1200px-Preston_North_End_FC.svg.png' },
      { name: 'Сандерленд', city: 'Сандерленд', stadium: 'Стэдиум оф Лайт', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Sunderland_AFC_logo.svg/1200px-Sunderland_AFC_logo.svg.png' },
      { name: 'Кардифф Сити', city: 'Кардифф', stadium: 'Кардифф Сити', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Cardiff_City_FC_logo.svg/1200px-Cardiff_City_FC_logo.svg.png' },
      { name: 'Бристоль Сити', city: 'Бристоль', stadium: 'Эштон Гейт', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Bristol_City_FC_logo.svg/1200px-Bristol_City_FC_logo.svg.png' },
      { name: 'Уотфорд', city: 'Уотфорд', stadium: 'Викаридж Роуд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/Watford.svg/1200px-Watford.svg.png' },
      { name: 'Миллуолл', city: 'Лондон', stadium: 'Ден', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Millwall_F.C._logo.svg/1200px-Millwall_F.C._logo.svg.png' },
      { name: 'Суонси Сити', city: 'Суонси', stadium: 'Либерти', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Swansea_City_AFC_logo.svg/1200px-Swansea_City_AFC_logo.svg.png' },
      { name: 'Сток Сити', city: 'Сток-он-Трент', stadium: 'Бет365', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Stoke_City_FC.svg/1200px-Stoke_City_FC.svg.png' },
      { name: 'КПР', city: 'Лондон', stadium: 'Лофтус Роуд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/31/Queens_Park_Rangers_crest.svg/1200px-Queens_Park_Rangers_crest.svg.png' },
      { name: 'Блэкберн Роверс', city: 'Блэкберн', stadium: 'Ивуд Парк', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/Blackburn_Rovers.svg/1200px-Blackburn_Rovers.svg.png' },
      { name: 'Плимут Аргайл', city: 'Плимут', stadium: 'Хоум Парк', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Plymouth_Argyle_F.C._logo.svg/1200px-Plymouth_Argyle_F.C._logo.svg.png' },
      { name: 'Шеффилд Уэнсдей', city: 'Шеффилд', stadium: 'Хиллсборо', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/88/Sheffield_Wednesday_badge.svg/1200px-Sheffield_Wednesday_badge.svg.png' },
      { name: 'Ротерем Юнайтед', city: 'Ротерем', stadium: 'Нью-Йорк', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Rotherham_United_FC.svg/1200px-Rotherham_United_FC.svg.png' },
      { name: 'Хаддерсфилд Таун', city: 'Хаддерсфилд', stadium: 'Джон Смитс', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7d/Huddersfield_Town_A.F.C._logo.png/1200px-Huddersfield_Town_A.F.C._logo.png' },
      { name: 'Бирмингем Сити', city: 'Бирмингем', stadium: 'Сент-Эндрюс', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Birmingham_City_FC_logo.svg/1200px-Birmingham_City_FC_logo.svg.png' },
      { name: 'Портсмут', city: 'Портсмут', stadium: 'Фраттон Парк', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/38/Portsmouth_FC_logo.svg/1200px-Portsmouth_FC_logo.svg.png' },
      { name: 'Дерби Каунти', city: 'Дерби', stadium: 'Прайд Парк', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Derby_County_F.C._Logo.svg/1200px-Derby_County_F.C._Logo.svg.png' },
      { name: 'Болтон Уондерерс', city: 'Болтон', stadium: 'Юниверсити оф Болтон', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Bolton_Wanderers_FC_logo.svg/1200px-Bolton_Wanderers_FC_logo.svg.png' },
      { name: 'Питерборо Юнайтед', city: 'Питерборо', stadium: 'Лондон Роуд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Peterborough_United.svg/1200px-Peterborough_United.svg.png' },
      { name: 'Барнсли', city: 'Барнсли', stadium: 'Оуквелл', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Barnsley_FC.svg/1200px-Barnsley_FC.svg.png' },
      { name: 'Оксфорд Юнайтед', city: 'Оксфорд', stadium: 'Кассам', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Oxford_United_FC_logo.svg/1200px-Oxford_United_FC_logo.svg.png' },
      { name: 'Блэкпул', city: 'Блэкпул', stadium: 'Блумфилд Роуд', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Blackpool_FC_logo.svg/1200px-Blackpool_FC_logo.svg.png' },
      { name: 'Чарльтон Атлетик', city: 'Лондон', stadium: 'Вэлли', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/Charlton_Athletic_FC_logo.svg/1200px-Charlton_Athletic_FC_logo.svg.png' },
    ]
  },
  "Испания": {
    "La Liga": [
      { name: 'Реал Мадрид', city: 'Мадрид', stadium: 'Сантьяго Бернабеу', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png' },
      { name: 'Барселона', city: 'Барселона', stadium: 'Камп Ноу', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png' },
      { name: 'Атлетико Мадрид', city: 'Мадрид', stadium: 'Цивитас Метрополитано', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png' },
      { name: 'Севилья', city: 'Севилья', stadium: 'Рамон Санчес Писхуан', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/1200px-Sevilla_FC_logo.svg.png' },
      { name: 'Реал Сосьедад', city: 'Сан-Себастьян', stadium: 'Аноэта', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/1200px-Real_Sociedad_logo.svg.png' },
      { name: 'Вильярреал', city: 'Вильярреаль', stadium: 'Эстадио де ла Керамика', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/70/Villarreal_CF_logo.svg/1200px-Villarreal_CF_logo.svg.png' },
      { name: 'Бетис', city: 'Севилья', stadium: 'Бенито Вильямарин', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Real_Betis_Balompi%C3%A9_%28logo%29.svg/1200px-Real_Betis_Balompi%C3%A9_%28logo%29.svg.png' },
      { name: 'Атлетик Бильбао', city: 'Бильбао', stadium: 'Сан-Мамес', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Club_Athletic_Bilbao_logo.svg/1200px-Club_Athletic_Bilbao_logo.svg.png' },
      { name: 'Осасуна', city: 'Памплона', stadium: 'Эль Садар', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/CA_Osasuna_logo.svg/1200px-CA_Osasuna_logo.svg.png' },
      { name: 'Жирона', city: 'Жирона', stadium: 'Монтиливи', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Girona_FC_Crest.svg/1200px-Girona_FC_Crest.svg.png' },
      { name: 'Райо Вальекано', city: 'Мадрид', stadium: 'Вальекас', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Rayo_Vallecano_de_Madrid_logo.svg/1200px-Rayo_Vallecano_de_Madrid_logo.svg.png' },
      { name: 'Мальорка', city: 'Пальма', stadium: 'Сон Моис', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/RCD_Mallorca_logo.svg/1200px-RCD_Mallorca_logo.svg.png' },
      { name: 'Сельта', city: 'Виго', stadium: 'Балаидос', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/12/RC_Celta_de_Vigo_logo.svg/1200px-RC_Celta_de_Vigo_logo.svg.png' },
      { name: 'Кадис', city: 'Кадис', stadium: 'Нуэво Мирандилья', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/58/C%C3%A1diz_CF_logo.svg/1200px-C%C3%A1diz_CF_logo.svg.png' },
      { name: 'Хетафе', city: 'Хетафе', stadium: 'Колизеум Альфонсо Перес', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Getafe_CF_logo.svg/1200px-Getafe_CF_logo.svg.png' },
      { name: 'Валенсия', city: 'Валенсия', stadium: 'Месталья', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valenciacf.svg/1200px-Valenciacf.svg.png' },
    ]
  },
  "Россия": {
    "RPL": [
      { name: 'Зенит', city: 'Санкт-Петербург', stadium: 'Газпром Арена', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/FC_Zenit_Saint_Petersburg_logo.svg/1200px-FC_Zenit_Saint_Petersburg_logo.svg.png' },
      { name: 'Спартак', city: 'Москва', stadium: 'Лукойл Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/FC_Spartak_Moscow_logo.svg/1200px-FC_Spartak_Moscow_logo.svg.png' },
      { name: 'ЦСКА', city: 'Москва', stadium: 'ВЭБ Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/06/PFC_CSKA_Moscow_Logo.svg/1200px-PFC_CSKA_Moscow_Logo.svg.png' },
      { name: 'Локомотив', city: 'Москва', stadium: 'РЖД Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/FC_Lokomotiv_Moscow_Logo.svg/1200px-FC_Lokomotiv_Moscow_Logo.svg.png' },
      { name: 'Динамо', city: 'Москва', stadium: 'ВТБ Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/FC_Dynamo_Moscow_logo.svg/1200px-FC_Dynamo_Moscow_logo.svg.png' },
      { name: 'Краснодар', city: 'Краснодар', stadium: 'Краснодар', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/FC_Krasnodar_logo.svg/1200px-FC_Krasnodar_logo.svg.png' },
      { name: 'Ростов', city: 'Ростов-на-Дону', stadium: 'Ростов Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/FC_Rostov_logo.svg/1200px-FC_Rostov_logo.svg.png' },
      { name: 'Ахмат', city: 'Грозный', stadium: 'Ахмат Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d7/FC_Akhmat_Grozny_logo.svg/1200px-FC_Akhmat_Grozny_logo.svg.png' },
      { name: 'Крылья Советов', city: 'Самара', stadium: 'Солидарность Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/PFK_Krylia_Sovetov_Samara_logo.svg/1200px-PFK_Krylia_Sovetov_Samara_logo.svg.png' },
      { name: 'Урал', city: 'Екатеринбург', stadium: 'Екатеринбург Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/FC_Ural_Sverdlovsk_Oblast_Logo.svg/1200px-FC_Ural_Sverdlovsk_Oblast_Logo.svg.png' },
      { name: 'Сочи', city: 'Сочи', stadium: 'Фишт', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/PFC_Sochi_Logo.svg/1200px-PFC_Sochi_Logo.svg.png' },
      { name: 'Оренбург', city: 'Оренбург', stadium: 'Газовик', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/FC_Orenburg_Logo.svg/1200px-FC_Orenburg_Logo.svg.png' },
      { name: 'Пари НН', city: 'Нижний Новгород', stadium: 'Нижний Новгород', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/FC_Pari_Nizhny_Novgorod_Logo.svg/1200px-FC_Pari_Nizhny_Novgorod_Logo.svg.png' },
      { name: 'Факел', city: 'Воронеж', stadium: 'Центральный', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Fakel_Voronezh_Logo.svg/1200px-Fakel_Voronezh_Logo.svg.png' },
      { name: 'Рубин', city: 'Казань', stadium: 'Ак Барс Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/FC_Rubin_Kazan_Logo.svg/1200px-FC_Rubin_Kazan_Logo.svg.png' },
      { name: 'Балтика', city: 'Калининград', stadium: 'Ростех Арена', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/FC_Baltika_Kaliningrad_Logo.svg/1200px-FC_Baltika_Kaliningrad_Logo.svg.png' },
    ]
  }
};