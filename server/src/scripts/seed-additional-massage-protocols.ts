import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import MassageProtocol from '../models/MassageProtocol'
import { transliterate } from 'transliteration'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const additionalMassageProtocols = [
  {
    name: {
      ru: 'Массаж лица',
      ro: 'Masajul facial',
    },
    description: {
      ru: 'Комплексный протокол массажа лица для омоложения, улучшения тонуса кожи и лимфодренажа',
      ro: 'Protocol complex de masaj facial pentru întinerire, îmbunătățirea tonusului pielii și drenaj limfatic',
    },
    type: 'therapeutic',
    duration: 45,
    difficulty: 'intermediate',
    content: {
      ru: `# Массаж лица

## Общая информация
Массаж лица — это терапевтическая процедура, направленная на улучшение состояния кожи, мышечного тонуса, кровообращения и лимфотока. Регулярные сеансы способствуют естественному омоложению, уменьшению отёков и улучшению цвета лица.

## Продолжительность
Полный сеанс: **45 минут**

## Подготовка
1. Тщательное очищение кожи лица, шеи и зоны декольте
2. Нанесение массажного масла или крема
3. Комфортная температура в помещении (22-24°C)
4. Мягкое освещение
5. Удобное положение клиента (лёжа на спине с приподнятым изголовьем)

## Основные зоны воздействия
- Лоб
- Область вокруг глаз
- Щёки и скулы
- Нос
- Подбородок
- Шея
- Зона декольте

## Протокол выполнения

### 1. Поглаживание (5 минут)
- Лёгкие поглаживающие движения от центра лба к вискам
- От крыльев носа к ушным раковинам
- От подбородка вдоль нижней челюсти к ушам
- Поглаживание шеи сверху вниз

### 2. Лимфодренаж (10 минут)
- Мягкие нажатия вдоль лимфатических путей
- От центра лба к вискам (3-5 повторений)
- Вокруг глаз от внутреннего к внешнему углу
- От носа к ушам вдоль скул
- От подбородка к ушам
- Шея: от ключиц к подбородку

### 3. Разминание мышц (15 минут)

**Лоб:**
- Круговые движения подушечками пальцев
- Зигзагообразные движения от центра к вискам
- Лёгкие пощипывания

**Область глаз:**
- Деликатные круговые движения вокруг орбиты
- Точечные нажатия на активные точки
- Похлопывания подушечками пальцев

**Щёки и скулы:**
- Круговое разминание жевательных мышц
- Движения вверх вдоль скуловой кости
- Лёгкие вибрации

**Подбородок и челюсть:**
- Разминание по линии нижней челюсти
- Круговые движения на жевательных мышцах
- Пощипывания подбородка

**Нос:**
- Поглаживание крыльев носа
- Лёгкое нажатие на точки у основания носа

### 4. Вибрация и тонизирование (10 минут)
- Лёгкие похлопывания подушечками пальцев по всему лицу
- Вибрационные движения вдоль массажных линий
- Пощипывания для стимуляции кровообращения

### 5. Завершение (5 минут)
- Успокаивающие поглаживания всего лица
- Лёгкие нажатия на акупунктурные точки
- Завершающее поглаживание шеи и декольте

## Массажные линии лица
1. От центра лба к вискам
2. От внутреннего угла глаза по верхнему веку к внешнему углу
3. От внешнего угла глаза по нижнему веку к внутреннему
4. От крыльев носа к козелку уха
5. От углов рта к мочке уха
6. От центра подбородка вдоль нижней челюсти к мочке уха
7. Шея: от ключиц к подбородку

## Рекомендации по частоте
- Курс: 10-15 процедур
- Периодичность: 2-3 раза в неделю
- Поддерживающие сеансы: 1 раз в неделю`,
      ro: `# Masajul facial

## Informații generale
Masajul facial este o procedură terapeutică destinată îmbunătățirii stării pielii, tonusului muscular, circulației sanguine și fluxului limfatic. Sesiunile regulate contribuie la întinerirea naturală, reducerea edemelor și îmbunătățirea culorii tenului.

## Durată
Sesiune completă: **45 minute**

## Pregătire
1. Curățarea amănunțită a pielii feței, gâtului și zonei decolteului
2. Aplicarea uleiului sau cremei de masaj
3. Temperatură confortabilă în încăpere (22-24°C)
4. Iluminare soft
5. Poziție confortabilă pentru client (culcat pe spate cu capul ușor ridicat)

## Zone principale de lucru
- Fruntea
- Zona din jurul ochilor
- Obrajii și pomeții
- Nasul
- Bărbia
- Gâtul
- Zona decolteului

## Protocol de execuție

### 1. Mângâieri (5 minute)
- Mișcări ușoare de mângâiere de la centrul frunții spre tâmple
- De la aripile nasului spre urechile
- De la bărbie de-a lungul maxilarului inferior spre urechi
- Mângâierea gâtului de sus în jos

### 2. Drenaj limfatic (10 minute)
- Apăsări ușoare de-a lungul căilor limfatice
- De la centrul frunții spre tâmple (3-5 repetări)
- În jurul ochilor de la colțul interior spre cel exterior
- De la nas spre urechi de-a lungul pomeților
- De la bărbie spre urechi
- Gâtul: de la clavicule spre bărbie

### 3. Frământarea mușchilor (15 minute)

**Fruntea:**
- Mișcări circulare cu vârfurile degetelor
- Mișcări zigzag de la centru spre tâmple
- Ciupituri ușoare

**Zona ochilor:**
- Mișcări circulare delicate în jurul orbitei
- Apăsări punctuale pe punctele active
- Tapotamente cu vârfurile degetelor

**Obrajii și pomeții:**
- Frământare circulară a mușchilor masticatori
- Mișcări ascendente de-a lungul osului pometic
- Vibrații ușoare

**Bărbia și maxilarul:**
- Frământare pe linia maxilarului inferior
- Mișcări circulare pe mușchii masticatori
- Ciupituri la nivelul bărbiei

**Nasul:**
- Mângâierea aripilor nasului
- Apăsare ușoară pe punctele de la baza nasului

### 4. Vibrații și tonifiere (10 minute)
- Tapotamente ușoare cu vârfurile degetelor pe toată fața
- Mișcări vibratorii de-a lungul liniilor de masaj
- Ciupituri pentru stimularea circulației sanguine

### 5. Finalizare (5 minute)
- Mângâieri calmante pe toată fața
- Apăsări ușoare pe punctele de acupunctură
- Mângâiere finală a gâtului și decolteului

## Liniile de masaj facial
1. De la centrul frunții spre tâmple
2. De la colțul interior al ochiului pe pleoapă superioară spre colțul exterior
3. De la colțul exterior al ochiului pe pleoapă inferioară spre cel interior
4. De la aripile nasului spre tragusul urechii
5. De la colțurile gurii spre lobul urechii
6. De la centrul bărbiei de-a lungul maxilarului inferior spre lobul urechii
7. Gâtul: de la clavicule spre bărbie

## Recomandări privind frecvența
- Cură: 10-15 proceduri
- Periodicitate: 2-3 ori pe săptămână
- Sesiuni de întreținere: o dată pe săptămână`,
    },
    benefits: {
      ru: `## Основные преимущества

### Эстетические эффекты
- **Омоложение кожи** — стимуляция выработки коллагена и эластина
- **Улучшение цвета лица** — активизация кровообращения
- **Уменьшение отёков** — нормализация лимфотока
- **Разглаживание морщин** — расслабление мимических мышц
- **Подтяжка овала лица** — повышение тонуса мышц

### Терапевтические эффекты
- Снятие напряжения мимических мышц
- Улучшение микроциркуляции
- Устранение застойных явлений
- Нормализация работы сальных желёз
- Улучшение усвоения косметических средств

### Психоэмоциональные эффекты
- Глубокое расслабление
- Снятие стресса
- Улучшение сна
- Повышение настроения
- Общее омоложение организма`,
      ro: `## Beneficii principale

### Efecte estetice
- **Întinerirea pielii** — stimularea producției de colagen și elastină
- **Îmbunătățirea culorii tenului** — activarea circulației sanguine
- **Reducerea edemelor** — normalizarea fluxului limfatic
- **Netezirea ridurilor** — relaxarea mușchilor mimici
- **Lifting-ul ovalului feței** — creșterea tonusului muscular

### Efecte terapeutice
- Eliminarea tensiunii musculare mimice
- Îmbunătățirea microcirculației
- Eliminarea fenomenelor congestive
- Normalizarea funcționării glandelor sebacee
- Îmbunătățirea absorbției produselor cosmetice

### Efecte psiho-emoționale
- Relaxare profundă
- Eliminarea stresului
- Îmbunătățirea somnului
- Creșterea dispoziției
- Întinerirea generală a organismului`,
    },
    contraindications: {
      ru: `## Противопоказания

### Абсолютные противопоказания
- Острые воспалительные процессы на коже лица
- Герпес в активной фазе
- Гнойничковые высыпания
- Открытые раны и ссадины
- Онкологические заболевания
- Тяжёлые сердечно-сосудистые заболевания
- Недавние операции на лице (менее 6 месяцев)
- Невралгия тройничного нерва в острой фазе

### Относительные противопоказания
- Купероз (требуется щадящая техника)
- Очень чувствительная кожа
- Розацеа
- Недавние инъекции ботокса (менее 2 недель)
- Менструация (первые дни)
- Беременность (требуется консультация врача)
- Повышенная температура тела

### Особые указания
- При наличии кожных заболеваний требуется консультация дерматолога
- После косметологических процедур выдержать интервал 7-14 дней
- При чувствительной коже использовать минимальное давление
- Избегать области родинок и папиллом`,
      ro: `## Contraindicații

### Contraindicații absolute
- Procese inflamatorii acute pe pielea feței
- Herpes în fază activă
- Erupții purulente
- Răni și zgârieturi deschise
- Boli oncologice
- Boli cardiovasculare grave
- Operații recente pe față (mai puțin de 6 luni)
- Nevralgie a nervului trigemen în fază acută

### Contraindicații relative
- Cuperoza (necesită tehnică delicată)
- Piele foarte sensibilă
- Rozacee
- Injecții recente cu botox (mai puțin de 2 săptămâni)
- Menstruație (primele zile)
- Sarcină (necesită consultarea medicului)
- Temperatură corporală crescută

### Indicații speciale
- În prezența bolilor de piele necesită consultarea dermatologului
- După proceduri cosmetologice să se respecte interval de 7-14 zile
- La pielea sensibilă să se utilizeze presiune minimă
- Să se evite zona aluniților și papilomelor`,
    },
    technique: {
      ru: `## Техника выполнения массажа лица

### Основные правила
1. **Направление движений** — строго по массажным линиям
2. **Плавность** — все движения должны быть мягкими и непрерывными
3. **Симметричность** — обе стороны лица массируются одинаково
4. **Постепенность** — начинать с лёгких прикосновений, постепенно увеличивая давление

### Базовые техники

#### Поглаживание
- Выполняется всей ладонью или подушечками пальцев
- Давление минимальное
- Темп медленный, успокаивающий
- Начало и завершение каждого этапа

#### Растирание
- Выполняется подушечками 2-4 пальцев
- Круговые или спиралевидные движения
- Среднее давление
- Способствует разогреву тканей

#### Разминание
- Захват и смещение кожи
- Круговые движения различной амплитуды
- Умеренное давление
- Основная техника для проработки мышц

#### Вибрация
- Быстрые колебательные движения
- Выполняется кончиками пальцев
- Стимулирует кровообращение и лимфоток

#### Похлопывание (тапотемент)
- Лёгкие ритмичные удары подушечками пальцев
- Тонизирует кожу и мышцы
- Завершающая техника

### Работа с отдельными зонами

#### Лоб
1. Поглаживание от центра к вискам (обеими руками)
2. Круговые движения по всей поверхности лба
3. Зигзагообразные движения снизу вверх
4. Лёгкие пощипывания по массажным линиям

#### Глаза
1. Лёгкие круговые движения вокруг орбиты
2. Точечные нажатия на активные точки
3. Мягкое похлопывание подушечками пальцев
4. **Важно:** минимальное давление, деликатность

#### Нос
1. Поглаживание переносицы сверху вниз
2. Круговые движения у крыльев носа
3. Лёгкое нажатие на точки у основания носа

#### Щёки
1. Поглаживание от носа к ушам
2. Круговые разминания жевательных мышц
3. Лёгкие вибрации
4. Движения вверх вдоль скуловой кости

#### Подбородок
1. Разминание по линии нижней челюсти
2. Пощипывания подбородка
3. Круговые движения на подбородке

#### Шея
1. Поглаживание сверху вниз (без давления на область щитовидной железы)
2. Круговые движения по бокам шеи
3. Лёгкие разминания затылочной области

### Завершение сеанса
1. Общее поглаживание всего лица
2. Лёгкие нажатия на акупунктурные точки
3. Успокаивающие движения на шее и декольте
4. Нанесение завершающего крема или маски`,
      ro: `## Tehnica de execuție a masajului facial

### Reguli de bază
1. **Direcția mișcărilor** — strict pe liniile de masaj
2. **Fluiditate** — toate mișcările trebuie să fie blânde și continue
3. **Simetrie** — ambele părți ale feței se masează identic
4. **Progresivitate** — începeți cu atingeri ușoare, crescând treptat presiunea

### Tehnici de bază

#### Mângâierea
- Se execută cu toată palma sau cu vârfurile degetelor
- Presiune minimă
- Ritm lent, calmant
- Începutul și finalizarea fiecărei etape

#### Frecarea
- Se execută cu vârfurile a 2-4 degete
- Mișcări circulare sau spiralate
- Presiune medie
- Contribuie la încălzirea țesuturilor

#### Frământarea
- Prinderea și deplasarea pielea
- Mișcări circulare de amplitudine diferită
- Presiune moderată
- Tehnica principală pentru lucrul mușchilor

#### Vibrația
- Mișcări oscilatorii rapide
- Se execută cu vârfurile degetelor
- Stimulează circulația și fluxul limfatic

#### Tapotament
- Loviri ușoare ritmice cu vârfurile degetelor
- Tonifică pielea și mușchii
- Tehnică de finalizare

### Lucrul cu zone separate

#### Fruntea
1. Mângâiere de la centru spre tâmple (cu ambele mâini)
2. Mișcări circulare pe toată suprafața frunții
3. Mișcări zigzag de jos în sus
4. Ciupituri ușoare pe liniile de masaj

#### Ochii
1. Mișcări circulare ușoare în jurul orbitei
2. Apăsări punctuale pe punctele active
3. Tapotament moale cu vârfurile degetelor
4. **Important:** presiune minimă, delicatețe

#### Nasul
1. Mângâierea punții nasului de sus în jos
2. Mișcări circulare la aripile nasului
3. Apăsare ușoară pe punctele de la baza nasului

#### Obrajii
1. Mângâiere de la nas spre urechi
2. Frământări circulare ale mușchilor masticatori
3. Vibrații ușoare
4. Mișcări ascendente de-a lungul osului pometic

#### Bărbia
1. Frământare pe linia maxilarului inferior
2. Ciupituri la nivelul bărbiei
3. Mișcări circulare pe bărbie

#### Gâtul
1. Mângâiere de sus în jos (fără presiune pe zona glandei tiroide)
2. Mișcări circulare pe părțile laterale ale gâtului
3. Frământări ușoare ale zonei occipitale

### Finalizarea sesiunii
1. Mângâiere generală a întregii fețe
2. Apăsări ușoare pe punctele de acupunctură
3. Mișcări calmante pe gât și decolteu
4. Aplicarea cremei sau măștii finale`,
    },
    images: [],
    videos: [],
    order: 6,
    isPublished: true,
  },
  {
    name: {
      ru: 'Массаж груди (женский)',
      ro: 'Masajul sânilor (feminin)',
    },
    description: {
      ru: 'Деликатный массаж грудной области для улучшения формы, профилактики заболеваний и общего оздоровления',
      ro: 'Masaj delicat al zonei toracice pentru îmbunătățirea formei, prevenirea bolilor și sănătate generală',
    },
    type: 'therapeutic',
    duration: 30,
    difficulty: 'intermediate',
    content: {
      ru: `# Массаж груди (женский)

## Общая информация
Массаж груди — это деликатная терапевтическая процедура, направленная на улучшение кровообращения, лимфотока, поддержание упругости и профилактику заболеваний молочных желёз. Выполняется с особой осторожностью и требует профессиональных навыков.

## Продолжительность
Полный сеанс: **30 минут**

## Важные указания
⚠️ **Массаж выполняется ТОЛЬКО женщиной-специалистом**
⚠️ **Требуется предварительная консультация маммолога**
⚠️ **Техника должна быть максимально деликатной**

## Подготовка
1. Комфортная температура в помещении (23-25°C)
2. Использование качественного массажного масла
3. Положение: лёжа на спине
4. Предварительное разогревание рук массажиста
5. Создание доверительной атмосферы

## Анатомические особенности
- Молочная железа состоит из железистой, жировой и соединительной ткани
- Отсутствие мышечной ткани в самой груди
- Поддержка обеспечивается связками Купера
- Развитая лимфатическая система
- Высокая чувствительность тканей

## Протокол выполнения

### 1. Предварительное расслабление (5 минут)
- Лёгкие поглаживания грудной клетки
- Расслабление межрёберных мышц
- Мягкие круговые движения вокруг груди

### 2. Работа с грудными мышцами (10 минут)

**Большая грудная мышца:**
- Поглаживание от грудины к плечу
- Лёгкое разминание
- Растирание в направлении мышечных волокон

**Межрёберные мышцы:**
- Деликатное растирание межрёберных промежутков
- Движения от грудины к бокам

### 3. Массаж области молочных желёз (10 минут)

**Техника "волна":**
- Очень мягкие поглаживающие движения
- От основания к ключице
- Строго по направлению лимфотока

**Круговые движения:**
- Лёгкие круговые поглаживания вокруг груди
- По часовой стрелке
- Без давления на саму железу

**Лимфодренаж:**
- От периферии к центру (к подмышечным лимфоузлам)
- Очень деликатные движения
- Стимуляция оттока лимфы

### 4. Завершающий этап (5 минут)
- Лёгкие вибрации
- Успокаивающие поглаживания
- Мягкое похлопывание области декольте

## Основные техники

### Поглаживание
- Всегда по направлению лимфотока
- От периферии к центру
- Минимальное давление
- Плавные, непрерывные движения

### Лёгкое разминание
- Только для грудных мышц
- Круговые движения
- Без захвата тканей молочной железы

### Вибрация
- Мягкие колебательные движения
- Стимуляция микроциркуляции
- Расслабление тканей

## Направления движений
1. От центра груди к подмышечным впадинам
2. От нижней части груди вверх к ключицам
3. Круговые движения вокруг груди (по часовой стрелке)
4. От грудины к плечам (работа с грудными мышцами)

## Что НЕЛЬЗЯ делать
❌ Сильное давление на ткани молочной железы
❌ Интенсивное разминание самой груди
❌ Резкие, прерывистые движения
❌ Массаж сосков
❌ Длительное воздействие на одну область
❌ Использование ударных техник`,
      ro: `# Masajul sânilor (feminin)

## Informații generale
Masajul sânilor este o procedură terapeutică delicată, destinată îmbunătățirii circulației sanguine, fluxului limfatic, menținerii elasticității și prevenirii bolilor glandelor mamare. Se execută cu precauție deosebită și necesită competențe profesionale.

## Durată
Sesiune completă: **30 minute**

## Indicații importante
⚠️ **Masajul se execută NUMAI de către specialist femeie**
⚠️ **Necesită consultare prealabilă cu mamologul**
⚠️ **Tehnica trebuie să fie cât mai delicată**

## Pregătire
1. Temperatură confortabilă în încăpere (23-25°C)
2. Utilizarea unui ulei de masaj de calitate
3. Poziție: culcat pe spate
4. Încălzirea prealabilă a mâinilor maseusei
5. Crearea unei atmosfere de încredere

## Particularități anatomice
- Glanda mamară constă din țesut glandular, adipos și conjunctiv
- Absența țesutului muscular în sânul propriu-zis
- Susținerea este asigurată de ligamentele Cooper
- Sistem limfatic dezvoltat
- Sensibilitate înaltă a țesuturilor

## Protocol de execuție

### 1. Relaxare preliminară (5 minute)
- Mângâieri ușoare ale cutiei toracice
- Relaxarea mușchilor intercostali
- Mișcări circulare blânde în jurul sânului

### 2. Lucrul cu mușchii pectorali (10 minute)

**Mușchiul pectoral mare:**
- Mângâiere de la stern spre umăr
- Frământare ușoară
- Frecare în direcția fibrelor musculare

**Mușchi intercostali:**
- Frecare delicată a spațiilor intercostale
- Mișcări de la stern spre părți laterale

### 3. Masajul zonei glandelor mamare (10 minute)

**Tehnica "val":**
- Mișcări de mângâiere foarte blânde
- De la bază spre claviculă
- Strict în direcția fluxului limfatic

**Mișcări circulare:**
- Mângâieri circulare ușoare în jurul sânului
- În sensul acelor de ceasornic
- Fără presiune pe glanda însăși

**Drenaj limfatic:**
- De la periferie spre centru (spre ganglionii limfatici axilari)
- Mișcări foarte delicate
- Stimularea drenajului limfatic

### 4. Etapa finală (5 minute)
- Vibrații ușoare
- Mângâieri calmante
- Tapotament moale al zonei decolteului

## Tehnici principale

### Mângâierea
- Întotdeauna în direcția fluxului limfatic
- De la periferie spre centru
- Presiune minimă
- Mișcări fluide, continue

### Frământare ușoară
- Doar pentru mușchii pectorali
- Mișcări circulare
- Fără prinderea țesuturilor glandei mamare

### Vibrația
- Mișcări oscilatorii blânde
- Stimularea microcirculației
- Relaxarea țesuturilor

## Direcții ale mișcărilor
1. De la centrul sânului spre axile
2. De la partea inferioară a sânului în sus spre clavicule
3. Mișcări circulare în jurul sânului (în sensul acelor de ceasornic)
4. De la stern spre umeri (lucrul cu mușchii pectorali)

## Ce NU trebuie făcut
❌ Presiune puternică pe țesuturile glandei mamare
❌ Frământare intensivă a sânului însuși
❌ Mișcări bruște, întrerupte
❌ Masajul mameloanelor
❌ Impact prelungit pe o zonă
❌ Utilizarea tehnicilor de percuție`,
    },
    benefits: {
      ru: `## Основные преимущества

### Оздоровительные эффекты
- **Улучшение кровообращения** — питание тканей молочной железы
- **Активизация лимфотока** — профилактика застойных явлений
- **Повышение упругости** — стимуляция выработки коллагена
- **Профилактика мастопатии** — предупреждение уплотнений
- **Улучшение формы груди** — поддержание тонуса связок

### Терапевтические эффекты
- Снятие напряжения в грудных мышцах
- Улучшение осанки
- Профилактика застойных явлений
- Нормализация гормонального баланса
- Улучшение общего самочувствия

### Психоэмоциональные эффекты
- Повышение уверенности в себе
- Улучшение восприятия своего тела
- Снятие стресса
- Общее расслабление`,
      ro: `## Beneficii principale

### Efecte de sănătate
- **Îmbunătățirea circulației sanguine** — nutriția țesuturilor glandei mamare
- **Activarea fluxului limfatic** — prevenirea fenomenelor congestive
- **Creșterea elasticității** — stimularea producției de colagen
- **Prevenirea mastopatiei** — prevenirea indurațiilor
- **Îmbunătățirea formei sânilor** — menținerea tonusului ligamentelor

### Efecte terapeutice
- Eliminarea tensiunii în mușchii pectorali
- Îmbunătățirea posturii
- Prevenirea fenomenelor congestive
- Normalizarea echilibrului hormonal
- Îmbunătățirea stării generale de sănătate

### Efecte psiho-emoționale
- Creșterea încrederii în sine
- Îmbunătățirea percepției corpului propriu
- Eliminarea stresului
- Relaxare generală`,
    },
    contraindications: {
      ru: `## Противопоказания

### Абсолютные противопоказания
- Любые новообразования молочных желёз (доброкачественные и злокачественные)
- Воспалительные заболевания (мастит)
- Беременность и период лактации
- Повреждения кожи в области груди
- Острые инфекционные заболевания
- Повышенная температура тела
- Сердечно-сосудистые заболевания в стадии декомпенсации

### Относительные противопоказания
- Мастопатия (только с разрешения маммолога)
- Менструация
- Недавние операции на груди (менее 1 года)
- Заболевания щитовидной железы
- Повышенная чувствительность груди

### Обязательные требования
✓ Консультация маммолога перед началом курса
✓ Отсутствие патологических изменений в молочных железах
✓ Регулярное обследование у маммолога (1 раз в год)
✓ Профессиональная подготовка массажиста

### Когда немедленно прекратить массаж
- Появление боли
- Дискомфорт
- Появление уплотнений
- Выделения из сосков
- Изменение цвета кожи`,
      ro: `## Contraindicații

### Contraindicații absolute
- Orice formațiuni ale glandelor mamare (benigne și maligne)
- Boli inflamatorii (mastită)
- Sarcină și perioada de lactație
- Leziuni ale pielii în zona sânilor
- Boli infecțioase acute
- Temperatură corporală crescută
- Boli cardiovasculare în stadiu de decompensare

### Contraindicații relative
- Mastopatie (doar cu permisiunea mamologului)
- Menstruație
- Operații recente la sâni (mai puțin de 1 an)
- Boli ale glandei tiroide
- Sensibilitate crescută a sânilor

### Cerințe obligatorii
✓ Consultarea mamologului înainte de începerea curei
✓ Absența modificărilor patologice în glandele mamare
✓ Examinare regulată la mamolog (o dată pe an)
✓ Pregătire profesională a maseusei

### Când să opriți imediat masajul
- Apariția durerii
- Disconfort
- Apariția indurațiilor
- Secreții din mamelon
- Schimbarea culorii pielii`,
    },
    technique: {
      ru: `## Техника выполнения

### Подготовительный этап
1. **Разогревание рук** — температура рук должна быть комфортной
2. **Нанесение масла** — равномерно распределить по коже
3. **Установление контакта** — лёгкие поглаживания для адаптации

### Основные движения

#### 1. Поглаживание грудной клетки
- От центра грудины к плечам
- Лёгкие, плавные движения
- 5-7 повторений каждой рукой

#### 2. Работа с грудными мышцами
**Большая грудная мышца:**
- Поглаживание веерообразными движениями
- От грудины к подмышечной впадине
- Лёгкое разминание по ходу мышечных волокон

**Межрёберные мышцы:**
- Растирание межрёберных промежутков
- От грудины к бокам
- Подушечками пальцев

#### 3. Массаж области молочных желёз

**Круговые поглаживания:**
- Вокруг груди по часовой стрелке
- 4 квадранта: верхний наружный, нижний наружный, нижний внутренний, верхний внутренний
- По 3-4 круга в каждом квадранте

**Спиральные движения:**
- От основания груди к ключице
- Мягкие, волнообразные
- Без давления на ткань железы

**Лимфодренаж:**
- От нижней части груди к подмышечным лимфоузлам
- Очень нежные, направляющие движения
- Стимуляция оттока лимфы

#### 4. Работа с областью декольте
- Поглаживание от центра к плечам
- Лёгкие круговые движения
- Мягкие вибрации

### Завершение сеанса
1. Постепенное уменьшение интенсивности
2. Финальные поглаживания
3. Лёгкие похлопывания
4. Укрывание клиента

### Важные правила техники
✓ Все движения МЯГКИЕ и ПЛАВНЫЕ
✓ Направление — по линиям лимфотока
✓ Никогда не массировать соски
✓ Избегать прямого давления на ткань молочной железы
✓ Симметричная работа с обеими молочными железами
✓ Постоянный контакт с кожей (непрерывность движений)

### Рекомендуемая частота
- Курс: 10-12 процедур
- Периодичность: 2 раза в неделю
- Повторный курс: через 2-3 месяца
- Для поддержки: 1 раз в неделю`,
      ro: `## Tehnica de execuție

### Etapa preparatorie
1. **Încălzirea mâinilor** — temperatura mâinilor trebuie să fie confortabilă
2. **Aplicarea uleiului** — distribuție uniformă pe piele
3. **Stabilirea contactului** — mângâieri ușoare pentru adaptare

### Mișcări principale

#### 1. Mângâierea cutiei toracice
- De la centrul sternului spre umeri
- Mișcări ușoare, fluide
- 5-7 repetări cu fiecare mână

#### 2. Lucrul cu mușchii pectorali
**Mușchiul pectoral mare:**
- Mângâiere cu mișcări în evantai
- De la stern spre axilă
- Frământare ușoară pe parcursul fibrelor musculare

**Mușchi intercostali:**
- Frecarea spațiilor intercostale
- De la stern spre părți laterale
- Cu vârfurile degetelor

#### 3. Masajul zonei glandelor mamare

**Mângâieri circulare:**
- În jurul sânului în sensul acelor de ceasornic
- 4 cadrane: superior extern, inferior extern, inferior intern, superior intern
- Câte 3-4 cercuri în fiecare cadran

**Mișcări spiralate:**
- De la baza sânului spre claviculă
- Blânde, ondulatorii
- Fără presiune pe țesutul glandei

**Drenaj limfatic:**
- De la partea inferioară a sânului spre ganglionii limfatici axilari
- Mișcări foarte delicate, directoare
- Stimularea drenajului limfatic

#### 4. Lucrul cu zona decolteului
- Mângâiere de la centru spre umeri
- Mișcări circulare ușoare
- Vibrații blânde

### Finalizarea sesiunii
1. Reducerea treptată a intensității
2. Mângâieri finale
3. Tapotamente ușoare
4. Acoperirea clientei

### Reguli importante ale tehnicii
✓ Toate mișcările BLÂNDE și FLUIDE
✓ Direcția — pe liniile fluxului limfatic
✓ Niciodată să nu se maseze mameloanele
✓ Evitarea presiunii directe pe țesutul glandei mamare
✓ Lucru simetric cu ambele glande mamare
✓ Contact constant cu pielea (continuitatea mișcărilor)

### Frecvența recomandată
- Cură: 10-12 proceduri
- Periodicitate: de 2 ori pe săptămână
- Cură repetată: peste 2-3 luni
- Pentru susținere: o dată pe săptămână`,
    },
    images: [],
    videos: [],
    order: 7,
    isPublished: true,
  },
  {
    name: {
      ru: 'Триггерный массаж (Trigger Point Therapy)',
      ro: 'Masaj trigger point (Terapie puncte trigger)',
    },
    description: {
      ru: 'Терапевтическая техника работы с триггерными точками для устранения мышечной боли и спазмов',
      ro: 'Tehnică terapeutică de lucru cu punctele trigger pentru eliminarea durerii musculare și spasmelor',
    },
    type: 'therapeutic',
    duration: 60,
    difficulty: 'advanced',
    content: {
      ru: `# Триггерный массаж (Trigger Point Therapy)

## Общая информация
Триггерный массаж — это специализированная терапевтическая техника, направленная на устранение триггерных точек (мышечных уплотнений), вызывающих локальную и отражённую боль. Требует глубоких знаний анатомии и специальной подготовки.

## Продолжительность
Полный сеанс: **60 минут**

## Что такое триггерные точки

### Определение
**Триггерная точка** — это гиперраздражимая зона в скелетной мышце, которая:
- Ощущается как плотный узелок или тяж
- Болезненна при надавливании
- Вызывает отражённую боль в других областях
- Ограничивает диапазон движений
- Может вызывать слабость мышцы

### Виды триггерных точек

**Активные триггерные точки:**
- Постоянно вызывают боль
- Боль усиливается при надавливании
- Отражённая боль в характерных зонах
- Ограничение движений

**Латентные триггерные точки:**
- Болезненны только при надавливании
- Не вызывают спонтанной боли
- Могут активироваться при перегрузке
- Ограничивают эластичность мышцы

### Причины возникновения
- Перегрузка мышц
- Неправильная осанка
- Длительное статическое напряжение
- Травмы
- Стресс и эмоциональное напряжение
- Дефицит питательных веществ (магний, витамины группы В)

## Протокол выполнения

### 1. Диагностика (10 минут)

**Сбор анамнеза:**
- Локализация боли
- Характер боли (острая, тупая, жгучая)
- Когда появляется боль
- Что усиливает/уменьшает боль

**Пальпация:**
- Поиск плотных тяжей в мышцах
- Выявление болезненных узелков
- Проверка отражённой боли
- Оценка эластичности мышцы

**Тесты:**
- Активные движения
- Пассивные движения
- Растяжение мышц
- Определение ограничений

### 2. Подготовка тканей (10 минут)
- Общее поглаживание области
- Лёгкое растирание для разогрева
- Подготовка мышцы к глубокой работе
- Установление контакта с клиентом

### 3. Работа с триггерными точками (30 минут)

**Техника ишемической компрессии:**
1. Точное определение локализации точки
2. Постепенное увеличение давления
3. Удержание давления 30-90 секунд
4. Медленное уменьшение давления
5. Повтор 2-3 раза на одну точку

**Техника "pincer grip" (щипковый захват):**
- Захват мышцы между пальцами
- Прокатывание мышечных волокон
- Поиск уплотнений
- Точечное воздействие на триггер

**Техника "stripping" (прокатывание):**
- Глубокое скольжение вдоль мышечных волокон
- От центра триггерной точки
- В направлении прикрепления мышцы
- Медленное, контролируемое движение

### 4. Растяжение (5 минут)
- Пассивное растяжение обработанных мышц
- Удержание растяжения 20-30 секунд
- Повтор 2-3 раза
- Восстановление длины мышечных волокон

### 5. Завершение (5 минут)
- Лёгкие поглаживания
- Расслабление мышц
- Охлаждение тканей
- Инструкции клиенту

## Основные техники воздействия

### 1. Ишемическая компрессия (основная техника)

**Выполнение:**
- Найти триггерную точку пальпацией
- Разместить большой палец или локоть на точке
- Постепенно увеличивать давление до болевого порога (6-7 из 10)
- Удерживать давление, пока боль не уменьшится (30-90 сек)
- Медленно ослабить давление
- Повторить 2-3 раза

**Критерии эффективности:**
- Уменьшение боли под давлением
- Снижение отражённой боли
- Расслабление мышцы
- Увеличение подвижности

### 2. Глубокое прокатывание (Stripping)

**Выполнение:**
- Определить направление мышечных волокон
- Разместить палец/локоть на триггерной точке
- Медленно прокатывать вдоль мышцы (5-10 см/сек)
- От точки к точке прикрепления мышцы
- Повторить 3-5 раз

### 3. Техника "Spray and Stretch"

**Выполнение:**
- Охлаждение кожи над триггерной точкой
- Пассивное растяжение мышцы
- Удержание растяжения
- Повтор цикла

### 4. Постизометрическая релаксация (ПИР)

**Выполнение:**
- Мышца растягивается до барьера
- Клиент напрягает мышцу (изометрическое сокращение) 5-10 сек
- Клиент расслабляется
- Увеличение растяжения
- Повтор 3-5 раз

## Наиболее частые триггерные точки

### Верхняя трапеция
- **Локализация:** между шеей и плечом
- **Отражённая боль:** висок, основание черепа, задняя поверхность шеи
- **Причины:** работа за компьютером, стресс

### Жевательные мышцы
- **Локализация:** угол нижней челюсти
- **Отражённая боль:** зубы, висок, ухо
- **Причины:** сжатие челюсти, бруксизм

### Лестничные мышцы
- **Локализация:** боковая поверхность шеи
- **Отражённая боль:** плечо, рука, лопатка
- **Причины:** неправильная осанка, стресс

### Ягодичные мышцы
- **Локализация:** ягодицы
- **Отражённая боль:** задняя поверхность бедра, поясница
- **Причины:** длительное сидение, неправильная походка

### Четырёхглавая мышца бедра
- **Локализация:** передняя поверхность бедра
- **Отражённая боль:** колено, передняя поверхность бедра
- **Причины:** бег, приседания, велоспорт

## Уровни давления

**Шкала боли (0-10):**
- 0-3: Дискомфорт отсутствует
- 4-5: Лёгкий дискомфорт (недостаточно)
- **6-7: Терапевтическое давление** (оптимально)
- 8-9: Сильная боль (избыточно)
- 10: Невыносимая боль (недопустимо)

**Правило:** Работать на уровне 6-7 из 10`,
      ro: `# Masaj trigger point (Terapie puncte trigger)

## Informații generale
Masajul trigger point este o tehnică terapeutică specializată, destinată eliminării punctelor trigger (indurații musculare) care provoacă durere locală și reflexă. Necesită cunoștințe profunde de anatomie și pregătire specială.

## Durată
Sesiune completă: **60 minute**

## Ce sunt punctele trigger

### Definiție
**Punctul trigger** — este o zonă hiperiritabilă în mușchiul scheletic, care:
- Se simte ca un nodul dens sau un cordon
- Este dureroasă la apăsare
- Provoacă durere reflexă în alte zone
- Limitează amplitudinea mișcărilor
- Poate cauza slăbiciune musculară

### Tipuri de puncte trigger

**Puncte trigger active:**
- Provoacă constant durere
- Durerea se intensifică la apăsare
- Durere reflexă în zone caracteristice
- Limitare a mișcărilor

**Puncte trigger latente:**
- Dureroase doar la apăsare
- Nu provoacă durere spontană
- Se pot activa la suprasolicitare
- Limitează elasticitatea mușchiului

### Cauze de apariție
- Suprasolicitarea mușchilor
- Postură incorectă
- Tensiune statică prelungită
- Traumatisme
- Stress și tensiune emoțională
- Deficit de nutrienți (magneziu, vitamine B)

## Protocol de execuție

### 1. Diagnostic (10 minute)

**Colectarea anamenzei:**
- Localizarea durerii
- Caracterul durerii (acută, surdă, arsătoare)
- Când apare durerea
- Ce intensifică/diminuează durerea

**Palpare:**
- Căutarea cordoanelor dense în mușchi
- Identificarea nodulilor dureroși
- Verificarea durerii reflexe
- Evaluarea elasticității mușchiului

**Teste:**
- Mișcări active
- Mișcări pasive
- Întinderea mușchilor
- Determinarea limitărilor

### 2. Pregătirea țesuturilor (10 minute)
- Mângâiere generală a zonei
- Frecare ușoară pentru încălzire
- Pregătirea mușchiului pentru lucrul profund
- Stabilirea contactului cu clientul

### 3. Lucrul cu punctele trigger (30 minute)

**Tehnica compresiei ischemice:**
1. Determinarea exactă a localizării punctului
2. Creșterea treptată a presiunii
3. Menținerea presiunii 30-90 secunde
4. Reducerea lentă a presiunii
5. Repetare 2-3 ori per punct

**Tehnica "pincer grip" (prindere în cleșteу):**
- Prinderea mușchiului între degete
- Rularea fibrelor musculare
- Căutarea indurațiilor
- Impact punctual pe trigger

**Tehnica "stripping" (rulare):**
- Alunecare profundă de-a lungul fibrelor musculare
- De la centrul punctului trigger
- În direcția inserției musculare
- Mișcare lentă, controlată

### 4. Întindere (5 minute)
- Întindere pasivă a mușchilor lucrați
- Menținerea întinderii 20-30 secunde
- Repetare 2-3 ori
- Restabilirea lungimii fibrelor musculare

### 5. Finalizare (5 minute)
- Mângâieri ușoare
- Relaxarea mușchilor
- Răcirea țesuturilor
- Instrucțiuni pentru client

## Tehnici principale de impact

### 1. Compresie ischemică (tehnică principală)

**Execuție:**
- Găsirea punctului trigger prin palpare
- Plasarea policelui sau cotului pe punct
- Creșterea treptată a presiunii până la pragul durerii (6-7 din 10)
- Menținerea presiunii până când durerea se diminuează (30-90 sec)
- Slăbirea lentă a presiunii
- Repetare 2-3 ori

**Criterii de eficiență:**
- Diminuarea durerii sub presiune
- Reducerea durerii reflexe
- Relaxarea mușchiului
- Creșterea mobilității

### 2. Rulare profundă (Stripping)

**Execuție:**
- Determinarea direcției fibrelor musculare
- Plasarea degetului/cotului pe punctul trigger
- Rulare lentă de-a lungul mușchiului (5-10 cm/sec)
- De la punct la punctul de inserție a mușchiului
- Repetare 3-5 ori

### 3. Tehnica "Spray and Stretch"

**Execuție:**
- Răcirea pielii deasupra punctului trigger
- Întindere pasivă a mușchiului
- Menținerea întinderii
- Repetarea ciclului

### 4. Relaxare postizometrică (PIR)

**Execuție:**
- Mușchiul se întinde până la barieră
- Clientul contractă mușchiul (contracție izometrică) 5-10 sec
- Clientul se relaxează
- Creșterea întinderii
- Repetare 3-5 ori

## Puncte trigger cel mai frecvente

### Trapez superior
- **Localizare:** între gât și umăr
- **Durere reflexă:** tâmplă, baza craniului, partea posterioară a gâtului
- **Cauze:** lucru la computer, stress

### Mușchi masticatori
- **Localizare:** unghiul maxilarului inferior
- **Durere reflexă:** dinți, tâmplă, ureche
- **Cauze:** strângerea maxilarelor, bruxism

### Mușchi scaleni
- **Localizare:** suprafața laterală a gâtului
- **Durere reflexă:** umăr, braț, omoplat
- **Cauze:** postură incorectă, stress

### Mușchi fesieri
- **Localizare:** fese
- **Durere reflexă:** partea posterioară a coapsei, zona lombară
- **Cauze:** ședere prelungită, mers incorect

### Mușchiul cvadriceps femural
- **Localizare:** partea anterioară a coapsei
- **Durere reflexă:** genunchi, partea anterioară a coapsei
- **Cauze:** alergare, genuflexiuni, ciclism

## Niveluri de presiune

**Scara durerii (0-10):**
- 0-3: Disconfort absent
- 4-5: Disconfort ușor (insuficient)
- **6-7: Presiune terapeutică** (optim)
- 8-9: Durere puternică (excesiv)
- 10: Durere insuportabilă (inadmisibil)

**Regula:** Lucru la nivel 6-7 din 10`,
    },
    benefits: {
      ru: `## Основные преимущества

### Терапевтические эффекты
- **Устранение боли** — снятие локальной и отражённой боли
- **Восстановление функции** — увеличение диапазона движений
- **Улучшение кровообращения** — нормализация питания тканей
- **Расслабление мышц** — снятие спазма и напряжения
- **Восстановление силы** — возвращение нормальной функции мышцы

### Долгосрочные эффекты
- Профилактика хронической боли
- Улучшение осанки
- Повышение работоспособности
- Снижение риска травм
- Улучшение качества жизни

### Показания к применению
- Хроническая мышечная боль
- Головные боли напряжения
- Боль в шее и плечах
- Боль в спине
- Ограничение подвижности
- Постуральные нарушения
- Спортивные травмы
- Синдром миофасциальной боли`,
      ro: `## Beneficii principale

### Efecte terapeutice
- **Eliminarea durerii** — înlăturarea durerii locale și reflexe
- **Restabilirea funcției** — creșterea amplitudinii mișcărilor
- **Îmbunătățirea circulației** — normalizarea nutriției țesuturilor
- **Relaxarea mușchilor** — înlăturarea spasmului și tensiunii
- **Restabilirea forței** — revenirea funcției normale a mușchiului

### Efecte pe termen lung
- Prevenirea durerii cronice
- Îmbunătățirea posturii
- Creșterea capacității de muncă
- Reducerea riscului de traumatisme
- Îmbunătățirea calității vieții

### Indicații de aplicare
- Durere musculară cronică
- Cefalee tensională
- Durere în gât și umeri
- Durere în spate
- Limitarea mobilității
- Tulburări posturale
- Traumatisme sportive
- Sindrom de durere miofascială`,
    },
    contraindications: {
      ru: `## Противопоказания

### Абсолютные противопоказания
- Острые травмы (менее 48 часов)
- Переломы костей
- Разрывы мышц или сухожилий
- Тромбоз глубоких вен
- Инфекционные заболевания
- Опухоли
- Остеопороз (тяжёлая форма)
- Гематомы в зоне воздействия

### Относительные противопоказания
- Беременность
- Менструация (первые дни)
- Приём антикоагулянтов
- Диабет (с нейропатией)
- Варикозное расширение вен
- Недавние операции
- Заболевания кожи в зоне воздействия
- Повышенная чувствительность к боли

### Особые указания
- При острой боли сначала необходима консультация врача
- Избегать работы над воспалёнными областями
- При онемении или покалывании прекратить воздействие
- Не работать непосредственно на суставах
- Избегать области позвоночника

### Побочные эффекты (нормальные)
- Болезненность после сеанса (24-48 часов)
- Лёгкое головокружение
- Временное усиление боли
- Усталость
- Эмоциональная реакция

**Эти эффекты проходят через 1-2 дня**`,
      ro: `## Contraindicații

### Contraindicații absolute
- Traumatisme acute (mai puțin de 48 ore)
- Fracturi osoase
- Rupturi musculare sau tendinoase
- Tromboză venoasă profundă
- Boli infecțioase
- Tumori
- Osteoporoză (formă gravă)
- Hematoame în zona de impact

### Contraindicații relative
- Sarcină
- Menstruație (primele zile)
- Administrare de anticoagulante
- Diabet (cu neuropatie)
- Varicoză
- Operații recente
- Boli de piele în zona de impact
- Sensibilitate crescută la durere

### Indicații speciale
- În caz de durere acută este necesară mai întâi consultarea medicului
- Evitați lucrul pe zonele inflamate
- În caz de amorțeală sau furnicături opriți impactul
- Nu lucrați direct pe articulații
- Evitați zona coloanei vertebrale

### Efecte secundare (normale)
- Durere după sesiune (24-48 ore)
- Amețeală ușoară
- Intensificare temporară a durerii
- Oboseală
- Reacție emoțională

**Aceste efecte trec în 1-2 zile**`,
    },
    technique: {
      ru: `## Продвинутые техники

### Анатомические ориентиры
Для эффективной работы необходимо знать:
- Точки прикрепления мышц
- Направление мышечных волокон
- Расположение лимфатических узлов
- Локализацию нервов и сосудов
- Паттерны отражённой боли

### Техника безопасности
✓ Постоянная коммуникация с клиентом
✓ Контроль уровня боли (6-7 из 10)
✓ Избегать резких движений
✓ Не работать на костных выступах
✓ Короткие ногти массажиста
✓ Использование подходящего инструмента (палец, локоть, инструмент)

### Инструменты для работы

**Большие пальцы:**
- Для небольших мышц
- Точная локализация
- Ограниченная сила

**Локти:**
- Для крупных мышц (ягодицы, спина)
- Большая сила воздействия
- Экономия рук массажиста

**Специальные инструменты:**
- Массажные крюки
- Массажные мячи
- Роллы для миофасциального релиза

### Последовательность воздействия

1. **Поверхностные слои первыми**
   - Начинать с лёгкого давления
   - Постепенно углубляться
   - Не форсировать доступ к глубоким триггерам

2. **От простого к сложному**
   - Сначала крупные мышцы
   - Затем мелкие и глубокие

3. **Проксимально-дистальный подход**
   - От центра тела к периферии
   - От основных мышц к вспомогательным

### Домашние рекомендации для клиента

**После сеанса:**
- Обильное питьё (вода)
- Избегать интенсивных нагрузок 24-48 часов
- Применение тепла (тёплая ванна)
- Лёгкая растяжка

**Между сеансами:**
- Самомассаж массажным мячом
- Упражнения на растяжку
- Коррекция осанки
- Управление стрессом
- Эргономика рабочего места

**Частота сеансов:**
- Острая боль: 2-3 раза в неделю (2-4 недели)
- Хроническая боль: 1-2 раза в неделю (4-8 недель)
- Поддержка: 1-2 раза в месяц`,
      ro: `## Tehnici avansate

### Repere anatomice
Pentru lucru eficient este necesar să cunoașteți:
- Punctele de inserție ale mușchilor
- Direcția fibrelor musculare
- Localizarea ganglionilor limfatici
- Localizarea nervilor și vaselor
- Tiparele durerii reflexe

### Tehnica de siguranță
✓ Comunicare constantă cu clientul
✓ Controlul nivelului de durere (6-7 din 10)
✓ Evitarea mișcărilor bruște
✓ Nu lucrați pe proeminențele osoase
✓ Unghii scurte ale maseurului
✓ Utilizarea instrumentului potrivit (deget, cot, instrument)

### Instrumente pentru lucru

**Policele:**
- Pentru mușchi mici
- Localizare precisă
- Forță limitată

**Coate:**
- Pentru mușchi mari (fese, spate)
- Forță mare de impact
- Economisirea mâinilor maseurului

**Instrumente speciale:**
- Cârlige de masaj
- Bile de masaj
- Role pentru eliberare miofascială

### Secvența impactului

1. **Straturile superficiale primele**
   - Începeți cu presiune ușoară
   - Aprofundați treptat
   - Nu forțați accesul la triggerii profunzi

2. **De la simplu la complex**
   - Mai întâi mușchii mari
   - Apoi cei mici și profunzi

3. **Abordare proximală-distală**
   - De la centrul corpului spre periferie
   - De la mușchii principali la cei auxiliari

### Recomandări de acasă pentru client

**După sesiune:**
- Consum abundent de apă
- Evitarea sarcinilor intense 24-48 ore
- Aplicarea căldurii (baie caldă)
- Întindere ușoară

**Între sesiuni:**
- Automasaj cu bila de masaj
- Exerciții de stretching
- Corectarea posturii
- Gestionarea stresului
- Ergonomia locului de muncă

**Frecvența sesiunilor:**
- Durere acută: 2-3 ori pe săptămână (2-4 săptămâni)
- Durere cronică: 1-2 ori pe săptămână (4-8 săptămâni)
- Întreținere: 1-2 ori pe lună`,
    },
    images: [],
    videos: [],
    order: 8,
    isPublished: true,
  },
  {
    name: {
      ru: 'СПА-массаж (Комплексная терапия)',
      ro: 'Masaj SPA (Terapie complexă)',
    },
    description: {
      ru: 'Комплексная СПА-процедура, включающая стоун-терапию, баночный массаж стеклянными банками, ароматические мешочки и традиционный ломи-ломи',
      ro: 'Procedură SPA complexă, incluzând stone-terapie, masaj cu ventuze de sticlă, săculețe aromatice și tradiționalul lomi-lomi',
    },
    type: 'therapeutic',
    duration: 90,
    difficulty: 'advanced',
    content: {
      ru: `# СПА-массаж (Комплексная терапия)

## Общая информация
СПА-массаж — это роскошная комплексная процедура, сочетающая различные традиционные и современные техники для достижения максимального расслабления, оздоровления и гармонии тела и духа. Включает четыре основные техники: стоун-терапию, баночный массаж стеклянными банками, работу с ароматическими мешочками и традиционный гавайский массаж ломи-ломи.

## Продолжительность
Полная процедура: **90 минут**

## Компоненты СПА-массажа

### 1. Стоун-терапия (Hot Stone Therapy) — 25 минут

**Что такое стоун-терапия:**
Древняя техника, использующая нагретые базальтовые камни для глубокого прогревания и расслабления мышц.

**Подготовка камней:**
- Температура: 50-60°C
- Материал: гладкие базальтовые камни
- Размеры: от мелких (для пальцев) до крупных (для спины)
- Количество: 30-50 камней различных размеров

**Размещение камней:**
1. **Вдоль позвоночника** — 7-8 камней
2. **На ладонях** — 2 камня
3. **Между пальцами ног** — 8 маленьких камней
4. **На животе** — 1 крупный камень (опционально)
5. **На лбу** (чакра третьего глаза) — 1 плоский камень

**Техника массажа камнями:**
- Длинные скользящие движения по спине
- Круговые движения на плечах
- Разминание мышц с использованием камней
- Точечное воздействие на триггерные зоны
- Чередование тёплых и прохладных камней (опционально)

**Эффекты:**
- Глубокое прогревание тканей
- Расслабление мышечных спазмов
- Улучшение кровообращения
- Детоксикация через усиление лимфотока
- Энергетический баланс (работа с чакрами)

### 2. Баночный массаж стеклянными банками — 20 минут

**Что такое баночный массаж:**
Традиционная китайская техника, использующая вакуум для стимуляции кровообращения, лимфотока и выведения токсинов.

**Материалы:**
- Стеклянные медицинские банки (диаметр 4-8 см)
- Массажное масло
- Специальные силиконовые банки для динамического массажа

**Техника постановки банок:**

**Статическая постановка (10 минут):**
1. Нанести масло на кожу
2. Создать вакуум в банке
3. Установить банки вдоль позвоночника, на плечах, пояснице
4. Оставить на 5-10 минут
5. Аккуратно снять, нажав на кожу рядом с банкой

**Динамический баночный массаж (10 минут):**
1. Силиконовые банки создают меньший вакуум
2. Скользящие движения вдоль мышц
3. Круговые движения на проблемных зонах
4. Зигзагообразные движения для лимфодренажа

**Направления движений:**
- Спина: от поясницы к плечам
- Бёдра: от колен к ягодицам
- Живот: круговые движения по часовой стрелке

**Эффекты:**
- Мощный лимфодренаж
- Устранение застойных явлений
- Выведение токсинов
- Разбивание целлюлита
- Повышение эластичности кожи
- Улучшение микроциркуляции

**Важно:**
- После процедуры могут оставаться временные круглые следы (проходят через 3-7 дней)
- Это нормальная реакция организма
- Не является синяком, а результатом усиленного кровообращения

### 3. Массаж ароматическими мешочками (Herbal Compress) — 20 минут

**Что такое травяные мешочки:**
Традиционная тайская техника, использующая мешочки с лечебными травами, разогретые паром.

**Состав мешочков:**
- **Лаванда** — расслабление, снятие стресса
- **Лемонграсс** — тонизирование, антисептик
- **Имбирь** — прогревание, стимуляция
- **Ромашка** — противовоспалительное действие
- **Мята** — охлаждение, освежение
- **Эвкалипт** — респираторная поддержка
- **Розмарин** — улучшение кровообращения

**Подготовка:**
1. Мешочки размером 10-15 см в диаметре
2. Разогрев на пару до 60-70°C
3. Проверка температуры на запястье
4. Использование 2-4 мешочков одновременно

**Техника применения:**

**Прессинг:**
- Прижимание мешочка к телу на 3-5 секунд
- Постепенное увеличение давления
- Работа по основным мышечным группам

**Круговые движения:**
- Мягкие круговые движения по коже
- Массаж суставов
- Проработка проблемных зон

**Прокатывание:**
- Длинные скользящие движения
- От периферии к центру
- Следование лимфатическим путям

**Зоны применения:**
1. Спина и плечи
2. Поясница
3. Ноги (икры, бёдра)
4. Руки
5. Живот (лёгкие круговые движения)
6. Стопы

**Эффекты:**
- Глубокое расслабление
- Ароматерапевтическое воздействие
- Прогревание мышц
- Снятие боли и воспаления
- Улучшение сна
- Укрепление иммунитета

### 4. Ломи-ломи (Гавайский массаж) — 25 минут

**Что такое ломи-ломи:**
Традиционный гавайский массаж, означающий "касание рук с любовью". Уникальная техника, использующая не только руки, но и предплечья, локти в текучих, танцевальных движениях.

**Философия:**
- Единство тела, разума и духа
- Течение энергии (Mana)
- Гармония с природой
- Любовь и забота в каждом движении

**Особенности техники:**

**Длинные непрерывные движения:**
- От головы до ног одним движением
- Использование предплечий
- Создание ощущения волны
- Ритмичность и плавность

**Работа предплечьями:**
- Широкий охват мышц
- Глубокое воздействие без боли
- Экономия сил массажиста
- Уникальные ощущения для клиента

**Ритм и танец:**
- Массажист двигается вокруг стола
- Плавные переходы
- Синхронизация движений
- Может сопровождаться традиционной музыкой

**Основные движения:**

**"Волна" (Wave):**
- Плавные, текучие движения по всему телу
- От головы через спину к ногам
- Создание ощущения океанских волн

**"Форбрейк" (Forearm break):**
- Глубокие движения предплечьями
- Разминание крупных мышечных групп
- От центра тела к периферии

**"Хула" (Hula movement):**
- Круговые движения бёдрами массажиста
- Перенос веса тела
- Создание ритма

**Последовательность:**
1. Спина (длинные волнообразные движения)
2. Ноги (от бёдер до стоп)
3. Руки (от плеч до кистей)
4. Живот (мягкие круговые движения)
5. Завершение (лёгкие поглаживания)

**Использование масел:**
- Обильное количество масла
- Кокосовое масло (традиционное)
- Возможно добавление эфирных масел

**Эффекты:**
- Глубокое расслабление
- Снятие стресса и тревоги
- Улучшение гибкости
- Энергетическое обновление
- Эмоциональное освобождение
- Духовное очищение

## Полный протокол СПА-массажа (90 минут)

### Подготовка (5 минут)
- Консультация с клиентом
- Выбор ароматических масел
- Подготовка камней и мешочков
- Создание атмосферы (музыка, освещение, ароматы)

### Этап 1: Стоун-терапия (25 минут)
- Размещение камней на теле
- Массаж тёплыми камнями
- Работа с энергетическими центрами

### Этап 2: Баночный массаж (20 минут)
- Статическая постановка банок
- Динамический массаж силиконовыми банками
- Лимфодренаж

### Этап 3: Травяные мешочки (20 минут)
- Ароматический прессинг
- Круговые движения
- Глубокое прогревание

### Этап 4: Ломи-ломи (25 минут)
- Непрерывные волнообразные движения
- Работа предплечьями
- Энергетическое завершение

### Завершение (5 минут)
- Медитативное расслабление
- Накрывание тёплым полотенцем
- Предложение травяного чая
- Время для отдыха`,
      ro: `# Masaj SPA (Terapie complexă)

## Informații generale
Masajul SPA este o procedură complexă de lux, combinând diverse tehnici tradiționale și moderne pentru atingerea relaxării maxime, sănătății și armoniei corpului și spiritului. Include patru tehnici principale: stone-terapie, masaj cu ventuze de sticlă, lucru cu săculețe aromatice și tradiționalul masaj hawaian lomi-lomi.

## Durată
Procedură completă: **90 minute**

## Componentele masajului SPA

### 1. Stone-terapie (Hot Stone Therapy) — 25 minute

**Ce este stone-terapia:**
Tehnică antică care folosește pietre bazaltice încălzite pentru încălzirea profundă și relaxarea mușchilor.

**Pregătirea pietrelor:**
- Temperatură: 50-60°C
- Material: pietre bazaltice netede
- Dimensiuni: de la mici (pentru degete) până la mari (pentru spate)
- Cantitate: 30-50 pietre de diverse dimensiuni

**Plasarea pietrelor:**
1. **De-a lungul coloanei vertebrale** — 7-8 pietre
2. **Pe palme** — 2 pietre
3. **Între degetele de la picioare** — 8 pietre mici
4. **Pe abdomen** — 1 piatră mare (opțional)
5. **Pe frunte** (chakra celui de-al treilea ochi) — 1 piatră plată

**Tehnica de masaj cu pietre:**
- Mișcări lungi glisante pe spate
- Mișcări circulare pe umeri
- Frământarea mușchilor folosind pietre
- Impact punctual pe zonele trigger
- Alternarea pietrelor calde și reci (opțional)

**Efecte:**
- Încălzire profundă a țesuturilor
- Relaxarea spasmelor musculare
- Îmbunătățirea circulației sanguine
- Detoxifiere prin intensificarea fluxului limfatic
- Echilibru energetic (lucru cu chakrele)

### 2. Masaj cu ventuze de sticlă — 20 minute

**Ce este masajul cu ventuze:**
Tehnică tradițională chineză care folosește vidul pentru stimularea circulației, fluxului limfatic și eliminarea toxinelor.

**Materiale:**
- Ventuze medicale din sticlă (diametru 4-8 cm)
- Ulei de masaj
- Ventuze speciale din silicon pentru masaj dinamic

**Tehnica de aplicare a ventuzelor:**

**Aplicare statică (10 minute):**
1. Aplicați ulei pe piele
2. Creați vid în ventuz
3. Instalați ventuzele de-a lungul coloanei, pe umeri, zona lombară
4. Lăsați timp de 5-10 minute
5. Îndepărtați cu grijă, apăsând pielea lângă ventuz

**Masaj dinamic cu ventuze (10 minute):**
1. Ventuzele din silicon creează vid mai mic
2. Mișcări glisante de-a lungul mușchilor
3. Mișcări circulare pe zonele problematice
4. Mișcări zigzag pentru drenaj limfatic

**Direcții ale mișcărilor:**
- Spate: de la zona lombară spre umeri
- Coapse: de la genunchi spre fese
- Abdomen: mișcări circulare în sensul acelor de ceasornic

**Efecte:**
- Drenaj limfatic puternic
- Eliminarea fenomenelor congestive
- Eliminarea toxinelor
- Descompunerea celulitei
- Creșterea elasticității pielii
- Îmbunătățirea microcirculației

**Important:**
- După procedură pot rămâne urme rotunde temporare (dispar în 3-7 zile)
- Aceasta este o reacție normală a organismului
- Nu este o vânătaie, ci rezultatul circulației intensificate

### 3. Masaj cu săculețe aromatice (Herbal Compress) — 20 minute

**Ce sunt săculețele cu plante:**
Tehnică tradițională tailandeză care folosește săculețe cu plante medicinale, încălzite cu aburi.

**Compoziția săculețelor:**
- **Lavandă** — relaxare, eliminarea stresului
- **Lemongrass** — tonifiere, antiseptic
- **Ghimbir** — încălzire, stimulare
- **Mușețel** — acțiune antiinflamatorie
- **Mentă** — răcire, revigorare
- **Eucalipt** — susținere respiratorie
- **Rozmarin** — îmbunătățirea circulației

**Pregătire:**
1. Săculețe de 10-15 cm diametru
2. Încălzire cu aburi până la 60-70°C
3. Verificarea temperaturii pe încheietura mâinii
4. Utilizarea a 2-4 săculețe simultan

**Tehnica de aplicare:**

**Presare:**
- Apăsarea săculețului pe corp timp de 3-5 secunde
- Creșterea treptată a presiunii
- Lucru pe grupele musculare principale

**Mișcări circulare:**
- Mișcări circulare blânde pe piele
- Masaj al articulațiilor
- Lucru pe zonele problematice

**Rulare:**
- Mișcări lungi glisante
- De la periferie spre centru
- Urmărirea căilor limfatice

**Zone de aplicare:**
1. Spate și umeri
2. Zona lombară
3. Picioare (gambe, coapse)
4. Brațe
5. Abdomen (mișcări circulare ușoare)
6. Tălpi

**Efecte:**
- Relaxare profundă
- Impact aromaterapeutic
- Încălzirea mușchilor
- Eliminarea durerii și inflamației
- Îmbunătățirea somnului
- Întărirea imunității

### 4. Lomi-lomi (Masaj hawaian) — 25 minute

**Ce este lomi-lomi:**
Masaj tradițional hawaian, însemnând "atingerea mâinilor cu dragoste". Tehnică unică care folosește nu doar mâinile, ci și antebratele, coatele în mișcări fluide, dansante.

**Filosofie:**
- Unitatea corpului, minții și spiritului
- Fluxul energiei (Mana)
- Armonie cu natura
- Dragoste și grijă în fiecare mișcare

**Particularități ale tehnicii:**

**Mișcări lungi continue:**
- De la cap până la picioare într-o singură mișcare
- Utilizarea antebratelor
- Crearea senzației de val
- Ritmicitate și fluiditate

**Lucrul cu antebratele:**
- Acoperire largă a mușchilor
- Impact profund fără durere
- Economisirea forțelor maseurului
- Senzații unice pentru client

**Ritm și dans:**
- Maseurul se mișcă în jurul mesei
- Tranziții fluide
- Sincronizarea mișcărilor
- Poate fi însoțit de muzică tradițională

**Mișcări principale:**

**"Valul" (Wave):**
- Mișcări fluide pe tot corpul
- De la cap prin spate la picioare
- Crearea senzației de valuri oceanice

**"Forebrake" (Forearm break):**
- Mișcări profunde cu antebratele
- Frământarea grupelor musculare mari
- De la centrul corpului spre periferie

**"Hula" (Hula movement):**
- Mișcări circulare ale șoldurilor maseurului
- Transferul greutății corpului
- Crearea ritmului

**Secvență:**
1. Spate (mișcări lungi ondulatorii)
2. Picioare (de la coapse la tălpi)
3. Brațe (de la umeri la mâini)
4. Abdomen (mișcări circulare blânde)
5. Finalizare (mângâieri ușoare)

**Utilizarea uleiurilor:**
- Cantitate abundentă de ulei
- Ulei de cocos (tradițional)
- Posibil adăugarea uleiurilor esențiale

**Efecte:**
- Relaxare profundă
- Eliminarea stresului și anxietății
- Îmbunătățirea flexibilității
- Reînnoire energetică
- Eliberare emoțională
- Purificare spirituală

## Protocol complet de masaj SPA (90 minute)

### Pregătire (5 minute)
- Consultare cu clientul
- Alegerea uleiurilor aromatice
- Pregătirea pietrelor și săculețelor
- Crearea atmosferei (muzică, iluminare, arome)

### Etapa 1: Stone-terapie (25 minute)
- Plasarea pietrelor pe corp
- Masaj cu pietre calde
- Lucru cu centrele energetice

### Etapa 2: Masaj cu ventuze (20 minute)
- Aplicare statică a ventuzelor
- Masaj dinamic cu ventuze din silicon
- Drenaj limfatic

### Etapa 3: Săculețe cu plante (20 minute)
- Presare aromatică
- Mișcări circulare
- Încălzire profundă

### Etapa 4: Lomi-lomi (25 minute)
- Mișcări ondulatorii continue
- Lucru cu antebratele
- Finalizare energetică

### Finalizare (5 minute)
- Relaxare meditativă
- Acoperire cu prosop cald
- Oferirea ceaiului din plante
- Timp pentru odihnă`,
    },
    benefits: {
      ru: `## Комплексные преимущества

### Физические эффекты
- **Глубокое расслабление мышц** — снятие напряжения и спазмов
- **Улучшение кровообращения** — питание всех тканей организма
- **Лимфодренаж** — выведение токсинов и лишней жидкости
- **Повышение эластичности кожи** — антицеллюлитный эффект
- **Снятие боли** — уменьшение хронических болей
- **Улучшение подвижности** — увеличение гибкости суставов

### Терапевтические эффекты
- Детоксикация организма
- Укрепление иммунной системы
- Нормализация обмена веществ
- Улучшение работы внутренних органов
- Антивозрастной эффект
- Гармонизация энергетических потоков

### Психоэмоциональные эффекты
- **Глубокая релаксация** — полное расслабление ума и тела
- **Снятие стресса** — уменьшение кортизола
- **Улучшение сна** — качественный глубокий сон
- **Эмоциональное освобождение** — высвобождение подавленных эмоций
- **Повышение настроения** — выработка эндорфинов
- **Духовное обновление** — чувство внутренней гармонии

### Долгосрочные преимущества
- Повышение общего тонуса организма
- Улучшение качества жизни
- Профилактика заболеваний
- Замедление процессов старения
- Повышение стрессоустойчивости`,
      ro: `## Beneficii complexe

### Efecte fizice
- **Relaxare profundă a mușchilor** — eliminarea tensiunii și spasmelor
- **Îmbunătățirea circulației** — nutriția tuturor țesuturilor organismului
- **Drenaj limfatic** — eliminarea toxinelor și lichidului în exces
- **Creșterea elasticității pielii** — efect anticelulitic
- **Eliminarea durerii** — reducerea durerilor cronice
- **Îmbunătățirea mobilității** — creșterea flexibilității articulațiilor

### Efecte terapeutice
- Detoxifierea organismului
- Întărirea sistemului imunitar
- Normalizarea metabolismului
- Îmbunătățirea funcționării organelor interne
- Efect antiîmbătrânire
- Armonizarea fluxurilor energetice

### Efecte psiho-emoționale
- **Relaxare profundă** — relaxarea completă a minții și corpului
- **Eliminarea stresului** — reducerea cortizolului
- **Îmbunătățirea somnului** — somn profund de calitate
- **Eliberare emoțională** — eliberarea emoțiilor reprimate
- **Creșterea dispoziției** — producerea endorfinelor
- **Reînnoire spirituală** — sentiment de armonie interioară

### Avantaje pe termen lung
- Creșterea tonusului general al organismului
- Îmbunătățirea calității vieții
- Prevenirea bolilor
- Încetinirea proceselor de îmbătrânire
- Creșterea rezistenței la stress`,
    },
    contraindications: {
      ru: `## Противопоказания

### Общие противопоказания для всех техник
- Острые инфекционные заболевания
- Повышенная температура тела
- Онкологические заболевания
- Тяжёлые сердечно-сосудистые заболевания
- Тромбоз, тромбофлебит
- Нарушения свёртываемости крови
- Открытые раны, ссадины
- Кожные заболевания в острой фазе

### Специфические противопоказания для стоун-терапии
- Нарушения чувствительности кожи
- Диабет с нейропатией
- Варикозное расширение вен (на зонах воздействия)
- Металлические импланты (локально)

### Специфические противопоказания для баночного массажа
- Очень чувствительная или тонкая кожа
- Склонность к кровоподтёкам
- Варикозное расширение вен (зоны воздействия)
- Приём антикоагулянтов
- Менструация (массаж живота)

### Относительные противопоказания
- Беременность (требуется консультация врача)
- Гипертония (контроль давления)
- Менструация (первые дни)
- Недавние операции
- Хронические заболевания в стадии обострения

### Особые указания
- Избегать приёма пищи за 1-2 часа до процедуры
- Не употреблять алкоголь за 24 часа до и после
- Сообщать о любых изменениях самочувствия во время процедуры
- После процедуры пить больше воды (1,5-2 литра)`,
      ro: `## Contraindicații

### Contraindicații generale pentru toate tehnicile
- Boli infecțioase acute
- Temperatură corporală crescută
- Boli oncologice
- Boli cardiovasculare grave
- Tromboză, tromboflebită
- Tulburări de coagulare a sângelui
- Răni deschise, zgârieturi
- Boli de piele în fază acută

### Contraindicații specifice pentru stone-terapie
- Tulburări de sensibilitate a pielii
- Diabet cu neuropatie
- Varicoză (pe zonele de impact)
- Implanturi metalice (local)

### Contraindicații specifice pentru masajul cu ventuze
- Piele foarte sensibilă sau subțire
- Tendință la echimoze
- Varicoză (zone de impact)
- Administrare de anticoagulante
- Menstruație (masaj abdominal)

### Contraindicații relative
- Sarcină (necesită consultarea medicului)
- Hipertensiune (control presiune)
- Menstruație (primele zile)
- Operații recente
- Boli cronice în fază de exacerbare

### Indicații speciale
- Evitați mesele cu 1-2 ore înainte de procedură
- Nu consumați alcool cu 24 ore înainte și după
- Raportați orice schimbare în stare în timpul procedurii
- După procedură beți mai multă apă (1,5-2 litri)`,
    },
    technique: {
      ru: `## Создание СПА-атмосферы

### Подготовка пространства

**Температура:**
- 23-25°C — комфортная для процедуры
- Без сквозняков
- Возможность регулировки

**Освещение:**
- Приглушённый свет
- Свечи (безопасные, без запаха или с лёгким ароматом)
- Регулируемая яркость

**Музыка:**
- Звуки природы (океан, дождь, лес)
- Традиционная гавайская музыка для ломи-ломи
- Медитативная музыка
- Громкость: фоновая, ненавязчивая

**Ароматы:**
- Эфирные масла в диффузоре
- Благовония (нежные, не резкие)
- Ароматические свечи
- Соответствие выбранным для массажа маслам

### Материалы и оборудование

**Для стоун-терапии:**
- Нагреватель для камней (специальный)
- Базальтовые камни различных размеров
- Термометр для контроля температуры
- Полотенца для размещения камней

**Для баночного массажа:**
- Стеклянные банки (набор 4-6 штук)
- Силиконовые банки (2-4 штуки)
- Массажное масло (обильное количество)
- Спирт для стерилизации (медицинские банки)

**Для травяных мешочков:**
- Паровой нагреватель
- Мешочки с травами (4-6 штук)
- Термозащитные перчатки
- Запасные мешочки

**Для ломи-ломи:**
- Массажное масло (кокосовое или специальное)
- Широкий массажный стол
- Мягкие полотенца

### Последовательность подготовки

**За 30 минут до клиента:**
1. Нагреть камни до нужной температуры
2. Подготовить паровой нагреватель для мешочков
3. Проверить температуру в помещении
4. Включить музыку
5. Зажечь свечи, включить диффузор
6. Подготовить все материалы на рабочем месте

**Встреча клиента:**
1. Краткая консультация
2. Выбор ароматов
3. Объяснение процедуры
4. Проверка противопоказаний

### Техника безопасности

**Работа с горячими камнями:**
✓ Всегда проверять температуру на себе
✓ Спрашивать клиента о комфорте
✓ Избегать области позвоночника (прямой контакт)
✓ Не оставлять камни без присмотра

**Работа с банками:**
✓ Проверять целостность кожи
✓ Не ставить банки на костные выступы
✓ Контролировать силу вакуума
✓ Предупредить о возможных следах

**Работа с мешочками:**
✓ Контролировать температуру постоянно
✓ Иметь запасные (более холодные) мешочки
✓ Избегать области лица (слишком горячо)
✓ Быстро реагировать на дискомфорт

### Рекомендации после процедуры

**Немедленно после:**
- Отдых 10-15 минут
- Травяной чай или вода
- Избегать резких движений

**В течение 24 часов:**
- Обильное питьё (2-3 литра воды)
- Лёгкая пища
- Избегать алкоголя
- Не принимать горячую ванну (душ тёплый — можно)
- Отдых, избегать интенсивных нагрузок

**Долгосрочные рекомендации:**
- Повторять процедуру раз в 2-4 недели
- Поддерживать водный баланс
- Практиковать самомассаж между сеансами
- Медитация и дыхательные практики

### Профессиональные секреты

**Для максимального эффекта:**
1. Синхронизируйте дыхание с клиентом
2. Поддерживайте непрерывность контакта
3. Работайте с намерением и осознанностью
4. Создавайте плавные переходы между техниками
5. Адаптируйте давление под индивидуальные потребности

**Энергетическая работа:**
- Визуализация потока энергии
- Работа с чакрами (опционально)
- Заземление до и после сеанса
- Очищение пространства`,
      ro: `## Crearea atmosferei SPA

### Pregătirea spațiului

**Temperatură:**
- 23-25°C — confortabilă pentru procedură
- Fără curenți de aer
- Posibilitate de reglare

**Iluminare:**
- Lumină atenuată
- Lumânări (sigure, fără miros sau cu aromă ușoară)
- Luminozitate reglabilă

**Muzică:**
- Sunete ale naturii (ocean, ploaie, pădure)
- Muzică tradițională hawaiană pentru lomi-lomi
- Muzică meditativă
- Volum: de fundal, discret

**Arome:**
- Uleiuri esențiale în difuzor
- Tămâie (delicate, nu ascuțite)
- Lumânări aromatice
- Corespondenți cu uleiurile alese pentru masaj

### Materiale și echipament

**Pentru stone-terapie:**
- Încălzitor pentru pietre (special)
- Pietre bazaltice de diverse dimensiuni
- Termometru pentru controlul temperaturii
- Prosoape pentru plasarea pietrelor

**Pentru masajul cu ventuze:**
- Ventuze din sticlă (set de 4-6 bucăți)
- Ventuze din silicon (2-4 bucăți)
- Ulei de masaj (cantitate abundentă)
- Alcool pentru sterilizare (ventuze medicale)

**Pentru săculețe cu plante:**
- Încălzitor cu aburi
- Săculețe cu plante (4-6 bucăți)
- Mănuși termoprotectoare
- Săculețe de rezervă

**Pentru lomi-lomi:**
- Ulei de masaj (cocos sau special)
- Masă de masaj largă
- Prosoape moi

### Secvența de pregătire

**Cu 30 minute înainte de client:**
1. Încălziți pietrele la temperatura necesară
2. Pregătiți încălzitorul cu aburi pentru săculețe
3. Verificați temperatura în încăpere
4. Porniți muzica
5. Aprindeți lumânările, porniți difuzorul
6. Pregătiți toate materialele la locul de muncă

**Întâlnirea clientului:**
1. Consultare scurtă
2. Alegerea aromelor
3. Explicarea procedurii
4. Verificarea contraindicațiilor

### Tehnica de siguranță

**Lucrul cu pietre fierbinți:**
✓ Verificați întotdeauna temperatura pe dumneavoastră
✓ Întrebați clientul despre confort
✓ Evitați zona coloanei vertebrale (contact direct)
✓ Nu lăsați pietrele nesupravegheat

**Lucrul cu ventuze:**
✓ Verificați integritatea pielii
✓ Nu puneți ventuze pe proeminențe osoase
✓ Controlați forța vidului
✓ Avertizați despre urmele posibile

**Lucrul cu săculețe:**
✓ Controlați temperatura constant
✓ Aveți săculețe de rezervă (mai reci)
✓ Evitați zona feței (prea fierbinte)
✓ Reacționați rapid la disconfort

### Recomandări după procedură

**Imediat după:**
- Odihnă 10-15 minute
- Ceai din plante sau apă
- Evitați mișcările bruște

**În 24 de ore:**
- Consum abundent de apă (2-3 litri)
- Mâncare ușoară
- Evitați alcoolul
- Nu faceți baie fierbinte (duș călduț — posibil)
- Odihnă, evitați eforturile intense

**Recomandări pe termen lung:**
- Repetați procedura la 2-4 săptămâni
- Mențineți echilibrul hidric
- Practicați automasajul între sesiuni
- Meditație și practici de respirație

### Secrete profesionale

**Pentru efect maxim:**
1. Sincronizați respirația cu clientul
2. Mențineți continuitatea contactului
3. Lucrați cu intenție și conștiință
4. Creați tranziții fluide între tehnici
5. Adaptați presiunea la nevoile individuale

**Lucrul energetic:**
- Vizualizarea fluxului de energie
- Lucrul cu chakrele (opțional)
- Grounding înainte și după sesiune
- Curățarea spațiului`,
    },
    images: [],
    videos: [],
    order: 9,
    isPublished: true,
  },
]

async function seedAdditionalMassageProtocols() {
  try {
    console.log('🌱 Starting to seed additional massage protocols...')

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connected successfully')

    // Insert additional protocols without clearing existing ones
    console.log('📝 Inserting additional massage protocols...')
    const inserted = []
    for (const protocolData of additionalMassageProtocols) {
      // Generate slug from Russian name
      const slug = transliterate(protocolData.name.ru)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const protocol = await MassageProtocol.create({ ...protocolData, slug })
      inserted.push(protocol)
    }

    console.log(`✅ Successfully seeded ${inserted.length} additional massage protocols!`)
    console.log('\n📋 List of new protocols:')
    inserted.forEach((protocol, index) => {
      console.log(`  ${index + 1}. ${protocol.name.ru} (${protocol.duration} мин, ${protocol.difficulty})`)
    })

    // Disconnect
    await mongoose.disconnect()
    console.log('\n✅ Database disconnected')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding additional massage protocols:', error)
    process.exit(1)
  }
}

// Run the seeder
seedAdditionalMassageProtocols()
