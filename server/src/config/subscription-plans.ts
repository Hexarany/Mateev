export interface SubscriptionPlan {
  id: string
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
  duration: number // in days
  features: {
    ru: string[]
    ro: string[]
  }
  stripePriceId?: string // Will be filled when integrating Stripe
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: {
      ru: 'Месячная подписка',
      ro: 'Abonament lunar'
    },
    description: {
      ru: 'Полный доступ к образовательной платформе на 1 месяц',
      ro: 'Acces complet la platforma educațională pentru 1 lună'
    },
    price: 9.99,
    currency: 'USD',
    duration: 30,
    features: {
      ru: [
        'Доступ ко всем анатомическим материалам',
        'Подробные описания мышц с триггерными точками',
        'Видеоматериалы по массажным техникам',
        'Тесты для проверки знаний',
        'Поддержка на русском и румынском языках'
      ],
      ro: [
        'Acces la toate materialele anatomice',
        'Descrieri detaliate ale mușchilor cu puncte trigger',
        'Materiale video cu tehnici de masaj',
        'Teste pentru verificarea cunoștințelor',
        'Suport în limbile rusă și română'
      ]
    },
    // stripePriceId will be set after creating price in Stripe
  },
  {
    id: 'yearly',
    name: {
      ru: 'Годовая подписка',
      ro: 'Abonament anual'
    },
    description: {
      ru: 'Полный доступ к образовательной платформе на 1 год (экономия 40%)',
      ro: 'Acces complet la platforma educațională pentru 1 an (economie 40%)'
    },
    price: 69.99,
    currency: 'USD',
    duration: 365,
    features: {
      ru: [
        'Все преимущества месячной подписки',
        'Экономия 40% по сравнению с помесячной оплатой',
        'Приоритетная поддержка',
        'Ранний доступ к новым материалам',
        'Сертификат об окончании курса'
      ],
      ro: [
        'Toate avantajele abonamentului lunar',
        'Economie de 40% comparativ cu plata lunară',
        'Suport prioritar',
        'Acces timpuriu la materiale noi',
        'Certificat de absolvire a cursului'
      ]
    },
  }
]

export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
}

export const TRIAL_DURATION_DAYS = 7 // Free trial for 7 days
