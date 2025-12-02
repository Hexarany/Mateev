export interface TierPlan {
  id: 'basic' | 'premium'
  name: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  price: number
  currency: string
  features: {
    ru: string[]
    ro: string[]
  }
  upgradeFromBasic?: number
}

export const TIER_PLANS: TierPlan[] = [
  {
    id: 'basic',
    name: {
      ru: 'Базовый доступ',
      ro: 'Acces de bază',
    },
    description: {
      ru: 'Доступ к основным материалам по анатомии и базовым протоколам массажа',
      ro: 'Acces la materiale de bază de anatomie și protocoale de masaj de bază',
    },
    price: 20,
    currency: 'USD',
    features: {
      ru: [
        'Полный доступ к темам анатомии',
        'Руководства по гигиене и профессиональным стандартам',
        '4 базовых протокола массажа (классический, медовый, баночный, антицеллюлитный)',
        'Пожизненный доступ к купленному контенту',
      ],
      ro: [
        'Acces complet la temele de anatomie',
        'Ghiduri de igienă și standarde profesionale',
        '4 protocoale de masaj de bază (clasic, cu miere, cu ventuze, anticelulitic)',
        'Acces pe viață la conținutul achiziționat',
      ],
    },
  },
  {
    id: 'premium',
    name: {
      ru: 'Премиум доступ',
      ro: 'Acces Premium',
    },
    description: {
      ru: 'Полный доступ ко всем материалам платформы без ограничений',
      ro: 'Acces complet la toate materialele platformei fără restricții',
    },
    price: 50,
    currency: 'USD',
    upgradeFromBasic: 30,
    features: {
      ru: [
        'Все преимущества Базового доступа',
        'Полный доступ ко всем протоколам массажа',
        'Триггерные точки с детальными описаниями и изображениями',
        'Интерактивные тесты для проверки знаний',
        'Интерактивные 3D модели анатомии',
        'Приоритетная поддержка',
        'Пожизненный доступ ко всему контенту',
        'Ранний доступ к новым материалам',
      ],
      ro: [
        'Toate avantajele accesului de bază',
        'Acces complet la toate protocoalele de masaj',
        'Puncte trigger cu descrieri detaliate și imagini',
        'Teste interactive pentru verificarea cunoștințelor',
        'Modele 3D interactive de anatomie',
        'Suport prioritar',
        'Acces pe viață la tot conținutul',
        'Acces anticipat la materiale noi',
      ],
    },
  },
]

export const getTierPlanById = (tierId: 'basic' | 'premium'): TierPlan | undefined => {
  return TIER_PLANS.find((plan) => plan.id === tierId)
}

// Define which massage protocols are available in Basic tier
// These slugs must match exactly with the database
export const BASIC_TIER_MASSAGE_PROTOCOLS = [
  'klassicheskiy-massazh-vsego-tela', // Классический массаж всего тела
  'medovyy-massazh', // Медовый массаж
  'banochnyy-vakuumnyy-massazh', // Баночный (вакуумный) массаж
  'antitsellyulitnyy-massazh', // Антицеллюлитный массаж
]
