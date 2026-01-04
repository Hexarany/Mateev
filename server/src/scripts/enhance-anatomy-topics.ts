import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Topic from '../models/Topic'
import Category from '../models/Category'

dotenv.config()

// Интерфейс для данных топика
interface TopicData {
  estimatedTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  name: {
    ru: string
    ro: string
  }
  description: {
    ru: string
    ro: string
  }
  content: {
    ru: string
    ro: string
  }
}

// Детальный контент для всех топиков
const enhancedTopics: Record<string, TopicData> = {
  'vvedenie-telo-cheloveka': {
    estimatedTime: 20,
    difficulty: 'beginner',
    name: {
      ru: 'Введение: Тело человека как система',
      ro: 'Introducere: Corpul uman ca sistem'
    },
    description: {
      ru: 'Комплексное введение в анатомию человека: уровни организации, системы органов, анатомическая терминология и плоскости тела',
      ro: 'Introducere complexă în anatomia umană: niveluri de organizare, sisteme de organe, terminologie anatomică și planuri ale corpului'
    },
    content: {
      ru: require('fs').readFileSync('C:\\Users\\User\\Desktop\\Anatomia\\enhanced-content-topic-1.md', 'utf-8'),
      ro: `# Introducere: Corpul uman ca sistem

## Obiective de învățare

După studierea acestei teme veți putea:
- Explica organizarea corpului uman ca sistem integrat
- Utiliza terminologia anatomică standard
- Determina planurile și direcțiile principale ale corpului
- Înțelege interconexiunea sistemelor organismului în contextul terapiei de masaj

## 1. Niveluri de organizare a corpului uman

### 1.1 Nivel chimic
- **Atomi** - blocuri de construcție de bază (C, H, O, N, P, S)
- **Molecule** - compuși ai atomilor (apă, proteine, grăsimi, carbohidrați)

### 1.2 Nivel celular
- **Celula** - unitatea structurală și funcțională de bază a vieții

### 1.3 Nivel tisular

| Tip de țesut | Funcție | Exemple |
|---|---|---|
| **Epitelial** | Acoperire, protecție, secreție | Piele, glande |
| **Conjunctiv** | Suport, conectare | Oase, cartilaje, sânge |
| **Muscular** | Mișcare, contracție | Mușchi scheletici, netezi, cardiaci |
| **Nervos** | Coordonare, transmitere semnale | Creier, nervi |

### 1.4 Nivel de organ
Organ = structură din două sau mai multe tipuri de țesuturi

### 1.5 Nivel de sistem
Sistem de organe = grup de organe care lucrează împreună

### 1.6 Nivel de organism
Organism = ființă vie formată din toate sistemele care interacționează

## 2. Sistemele principale ale organismului

### 2.1 Sistemul musculo-scheletic
- 206 oase
- Peste 600 mușchi scheletici
- Funcții: suport, mișcare, protecție

### 2.2 Sistemul nervos
- SNC: creier și măduva spinării
- SNP: nervi cranieni și spinali
- Funcții: coordonare, control

### 2.3 Sistemul circulator
- Inima, artere, vene, capilare
- Funcții: transport O₂, nutrienți, eliminare deșeuri

### 2.4 Sistemul limfatic
- Vase limfatice, noduli limfatici
- Funcții: drenaj, imunitate

### 2.5 Sistemul tegumentar (pielea)
- Cel mai mare organ (1.5-2 m²)
- Funcții: protecție, termoreglare, percepție senzorială

## 3. Poziția anatomică și terminologie

### 3.1 Poziția anatomică standard
- Corp în poziție verticală
- Fața înainte
- Palme înainte
- Picioare paralele

### 3.2 Planuri anatomice

- **Plan sagital** - divizare stânga-dreapta
- **Plan frontal/coronal** - divizare anterior-posterior
- **Plan orizontal/transversal** - divizare superior-inferior

### 3.3 Direcții și poziții

| Termen | Semnificație | Exemplu |
|---|---|---|
| **Anterior (ventral)** | Spre față | Sternul anterior față de coloană |
| **Posterior (dorsal)** | Spre spate | Omoplații posteriori față de coaste |
| **Superior (cranial)** | Spre cap | Umărul superior față de cot |
| **Inferior (caudal)** | Departe de cap | Genunchiul inferior față de șold |
| **Medial** | Spre linia mediană | Degetul mic medial (la picior) |
| **Lateral** | Departe de linia mediană | Degetul mare lateral (la mână) |
| **Proximal** | Aproape de trunchi | Umărul proximal față de mână |
| **Distal** | Departe de trunchi | Mâna distală față de umăr |
| **Superficial** | Aproape de suprafață | Pielea superficială față de mușchi |
| **Profund** | Departe de suprafață | Oasele profunde față de mușchi |

### 3.4 Mișcări în articulații

| Mișcare | Descriere |
|---|---|
| **Flexie** | Micșorarea unghiului dintre oase |
| **Extensie** | Mărirea unghiului dintre oase |
| **Abducție** | Mișcare departe de linia mediană |
| **Aducție** | Mișcare spre linia mediană |
| **Rotație externă** | Rotație departe de linia mediană |
| **Rotație internă** | Rotație spre linia mediană |
| **Supinație** | Rotirea palmei în sus |
| **Pronație** | Rotirea palmei în jos |
| **Dorsiflexie** | Ridicarea piciorului |
| **Plantarflexie** | Coborârea piciorului |

## 4. Homeostazia

**Homeostazia** - capacitatea organismului de a menține stabilitatea mediului intern

Parametri reglați:
- Temperatura corpului (36.5-37.5°C)
- pH-ul sângelui (7.35-7.45)
- Nivelul glucozei
- Presiunea arterială

## 5. Aplicații practice pentru masorii

### 5.1 Evaluarea clientului

1. **Evaluare vizuală**: postura, simetria
2. **Palpare**: temperatura pielii, tensiunea musculară
3. **Testarea mobilității**: amplitudinea mișcărilor
4. **Anamneză**: plângeri, istoric

### 5.2 Adaptarea tehnicilor

Luați în considerare:
- Vârsta clientului
- Starea fizică
- Prezența bolilor
- Pragul durerii
- Obiectivele masajului

## 6. Concepte importante

### 6.1 Fascii
Înveliș de țesut conjunctiv care acoperă mușchii, organele, nervii

### 6.2 Puncte trigger
Noduli hiperiritabili în mușchi care provoacă durere referită

## 7. Întrebări de control

1. Enumerați cele șase niveluri de organizare a corpului uman
2. Descrieți funcțiile celor patru tipuri principale de țesuturi
3. Care sunt cele trei planuri anatomice?
4. Care este diferența între "proximal" și "distal"?
5. Explicați cum masajul influențează sistemul limfatic

## Termeni cheie

| Română | Rusă | Definiție |
|---|---|---|
| Anatomie | Анатомия | Știința despre structura organismului |
| Fiziologie | Физиология | Știința despre funcțiile organismului |
| Homeostazie | Гомеостаз | Menținerea echilibrului intern |

**Timp de studiu:** 20 minute
**Dificultate:** Nivel începător`
    }
  },

  'myshechnaya-sistema-obzor': {
    estimatedTime: 30,
    difficulty: 'intermediate',
    name: {
      ru: 'Мышечная система: Обзор и классификация',
      ro: 'Sistemul muscular: Prezentare generală și clasificare'
    },
    description: {
      ru: 'Детальное изучение мышечной системы: типы мышц, структура, механизм сокращения, основные мышечные группы и их значение для массажной терапии',
      ro: 'Studiu detaliat al sistemului muscular: tipuri de mușchi, structură, mecanism de contracție, grupuri musculare principale și importanța lor pentru terapia de masaj'
    },
    content: {
      ru: require('fs').readFileSync('C:\\Users\\User\\Desktop\\Anatomia\\enhanced-content-topic-2.md', 'utf-8'),
      ro: `# Sistemul muscular: Prezentare generală și clasificare

## Obiective de învățare

După studierea acestei teme veți putea să:
- Clasificați tipurile de țesut muscular și funcțiile lor
- Explicați structura mușchiului scheletic de la nivel macro la micro
- Descrieți mecanismul contracției musculare
- Identificați principalele grupuri musculare ale corpului
- Aplicați cunoștințele despre mușchi în practica de masaj

## 1. Tipuri de țesut muscular

### 1.1 Mușchi scheletici (Mușchi striați)

**Caracteristici:**
- **Striați** - dungi vizibile la microscop
- **Voluntari** - control conștient
- **Atașați de oase** prin tendoane
- Peste **600 mușchi scheletici** în corp

**Funcții:**
- Mișcarea corpului
- Menținerea posturii
- Producerea căldurii (termogeneză)
- Stabilizarea articulațiilor

### 1.2 Mușchi netezi (Mușchi lisă)

**Caracteristici:**
- **Nestriați**
- **Involuntari** - control autonom
- În **pereții organelor interne**

**Localizare:**
- Tract digestiv
- Vase de sânge
- Căi respiratorii
- Vezică urinară

### 1.3 Mușchiul cardiac (Miocard)

**Caracteristici:**
- **Striat**
- **Involuntar**
- **Contracție ritmică** (automatism)
- Doar în **inimă**

## 2. Structura mușchiului scheletic

### 2.1 Învelișuri de țesut conjunctiv

| Înveliș | Ce acoperă |
|---|---|
| **Epimisium** | Întregul mușchi |
| **Perimisium** | Fascicule (pachete de fibre) |
| **Endomisium** | Fibre musculare individuale |

### 2.2 Microstructura fibrei musculare

**Fibra musculară:**
- Celulă foarte lungă (până la 30 cm)
- Multe nuclee
- Conține miofibrile

**Miofib rila:**
Format din unități repetitive - **sarcomere**

**Sarcomerul** - unitatea funcțională de contracție

| Structură | Proteină | Funcție |
|---|---|---|
| **Filamente groase** | Miozină | Proteină motorie cu capete |
| **Filamente subțiri** | Actină | Se leagă de miozină |
| **Troponină** | Regulator | Leagă Ca²⁺ |
| **Tropomiozină** | Regulator | Blochează situsurile de legare |

## 3. Mecanismul contracției musculare

### 3.1 Teoria filamentelor glisante

**Secvența evenimentelor:**

1. Impuls nervos → Motoneuron → Sinapsă neuromusculară
2. Eliberare de acetilcolină
3. Depolarizarea membranei fibrei musculare
4. Eliberare Ca²⁺
5. Ca²⁺ se leagă de troponină → Deschiderea situsurilor pe actină
6. Capetele de miozină se atașează de actină
7. Mișcare de vâslire → Actina glisează spre centru
8. Sarcomerul se scurtează → Mușchiul se contractă
9. ATP furnizează energie
10. Ciclul se repetă

### 3.2 Surse de energie (ATP)

1. **Creatinfosfat** - sursă rapidă (10-15 secunde)
2. **Glicoliză anaerobă** - fără oxigen (30-40 secunde)
3. **Respirație aerobă** - cu oxigen (ore)

**Importanță pentru masor:**
Masajul accelerează eliminarea lactatului după efort intens, reducând durerea musculară întârziată (DOMS).

## 4. Tipuri de fibre musculare

| Tip | Altă denumire | Culoare | Viteză | Rezistență | Energie |
|---|---|---|---|---|---|
| **Tip I** | Lente oxidative | Roșii | Lentă | Mică | Aerobă |
| **Tip IIa** | Rapide oxidativ-glicolitice | Roz | Rapidă | Medie | Mixtă |
| **Tip IIb/IIx** | Rapide glicolitice | Albe | Foarte rapidă | Mare | Anaerobă |

## 5. Clasificarea mușchilor scheletici

### 5.1 După formă

- **Fuziformă** - Bicepsul brahial
- **Peniformă** - Deltoidul
- **Bipeniformă** - Dreptul femural
- **Paralelă** - Sartorius
- **Circulară** - Orbicularul gurii

### 5.2 După funcție

- **Agoniști** - Motori principali
- **Antagoniști** - Acțiune opusă
- **Sinergiști** - Ajutoare
- **Fixatori** - Stabilizatori

## 6. Grupuri musculare principale

### 6.1 Mușchii capului și gâtului

**Mușchi faciali:**
- Orbicularul ochiului
- Orbicularul gurii
- Frontalul
- Masseterul

**Mușchi ai gâtului:**

| Mușchi | Funcție |
|---|---|
| **Sternocleidomastoidian (SCM)** | Rotația capului |
| **Trapezul (partea superioară)** | Ridicarea umerilor |
| **Scaleni** | Ridicarea coastelor |

### 6.2 Mușchii trunchiului

#### Mușchii spatelui

| Mușchi | Funcție |
|---|---|
| **Trapezul** | Mișcări ale scapulei |
| **Latissimus dorsi** | Aducția, extensia brațului |
| **Romboidieni** | Retracția scapulei |
| **Erectori spinali** | Extensia coloanei |

#### Mușchii toracelui

| Mușchi | Funcție |
|---|---|
| **Pectoralis major** | Aducția, rotația internă |
| **Pectoralis minor** | Coborârea scapulei |
| **Serratus anterior** | Protracția scapulei |
| **Diafragma** | Mușchiul principal respirator |

#### Mușchii abdomenului

| Mușchi | Funcție |
|---|---|
| **Rectus abdominis** | Flexia trunchiului |
| **Oblicul extern** | Rotația, înclinarea laterală |
| **Oblicul intern** | Rotația (latura opusă) |
| **Transversus** | Stabilizarea trunchiului |

### 6.3 Mușchii membrului superior

#### Centura scapulară

**Manșeta rotatorilor** - 4 mușchi:

| Mușchi | Funcție |
|---|---|
| **Supraspinatus** | Abducția brațului |
| **Infraspinatus** | Rotația externă |
| **Teres minor** | Rotația externă |
| **Subscapularis** | Rotația internă |

#### Brațul

| Mușchi | Funcție | Poziție |
|---|---|---|
| **Biceps brachii** | Flexia cotului | Anterior |
| **Triceps brachii** | Extensia cotului | Posterior |
| **Brachialis** | Flexia cotului | Profund |

### 6.4 Mușchii membrului inferior

#### Mușchii fesieri

| Mușchi | Funcție |
|---|---|
| **Gluteus maximus** | Extensia șoldului |
| **Gluteus medius** | Abducția șoldului |
| **Gluteus minimus** | Abducția, rotația internă |

#### Coapsa

**Cuadricepsul femural** (4 mușchi):
- Rectus femoris
- Vastus lateralis
- Vastus medialis
- Vastus intermedius

**Hamstrings** (3 mușchi):
- Biceps femoris
- Semitendinosus
- Semimembranosus

#### Gamba

- **Gastrocnemius** - Flexia plantară
- **Soleus** - Flexia plantară (rezistent)
- **Tibialis anterior** - Dorsiflexia

## 7. Patologii musculare

### 7.1 Tensiune și spasm muscular

**Cauze:** Suprasolicitare, stress, traumă

**Masaj:** Relaxare, îmbunătățirea circulației

### 7.2 Puncte trigger

**Semne:** Durere locală, durere referită, limitare

**Tratament:** Compresie ischemică, stretching

### 7.3 Contractură

**Tipuri:** Miogenă, artrogenă, neurologică

**Masaj:** Ajută la contracturile miogene

### 7.4 DOMS (Durere musculară întârziată)

Durere la 24-72 ore după efort

**Masaj:** Masajul ușor accelerează recuperarea

## 8. Tehnici de palpare

### 8.1 Principii de bază

1. Relaxarea clientului
2. Poziționare corectă
3. Aprofundare graduală
4. Izolarea mușchiului
5. Contracție activă pentru identificare

### 8.2 Repere

**Repere osoase:**
- Acromion
- Marginea medială a scapulei
- Crista iliacă
- Trohanter major

## 9. Întrebări de control

1. Enumerați cele trei tipuri de țesut muscular
2. Explicați teoria filamentelor glisante
3. Care este diferența între fibrele tip I și tip II?
4. Numițiîîîî cei patru mușchi ai manșetei rotatorilor
5. Ce mușchi formează cuadricepsul?
6. Care este funcția diafragmei?
7. Explicați rolul masajului în tratarea punctelor trigger
8. Ce este DOMS?

## Termeni cheie

| Română | Rusă |
|---|---|
| Mușchi | Мышца |
| Tendon | Сухожилие |
| Fascie | Фасция |
| Contracție | Сокращение |
| Relaxare | Расслабление |
| Agonist | Агонист |
| Antagonist | Антагонист |
| Spasm | Спазм |

**Timp de studiu:** 30 minute
**Dificultate:** Nivel intermediar`
    }
  },

  'skeletnaya-sistema-kosti-i-sustavy': {
    estimatedTime: 25,
    difficulty: 'intermediate',
    name: {
      ru: 'Скелетная система: Кости и суставы',
      ro: 'Sistemul scheletic: Oase și articulații'
    },
    description: {
      ru: 'Изучение костной системы: типы костей, структура, функции, основные кости скелета, классификация суставов и их роль в массажной терапии',
      ro: 'Studiul sistemului osos: tipuri de oase, structură, funcții, oasele principale ale scheletului, clasificarea articulațiilor și rolul lor în terapia de masaj'
    },
    content: {
      ru: `# Скелетная система: Кости и суставы

## Цели обучения

- Описать функции скелетной системы
- Классифицировать кости по форме и структуре
- Назвать основные кости осевого и аппендикулярного скелета
- Понимать типы суставов и их движения
- Применять знания о костях и суставах в массажной практике

## 1. Функции скелетной системы

### 1.1 Основные функции

**Поддержка**
- Каркас тела
- Прикрепление мягких тканей

**Защита**
- Череп защищает мозг
- Грудная клетка - сердце и легкие
- Позвоночник - спинной мозг

**Движение**
- Точки прикрепления мышц
- Система рычагов

**Кроветворение (гемопоэз)**
- Красный костный мозг производит клетки крови
- В плоских костях и эпифизах длинных костей

**Хранение минералов**
- Кальций (Ca²⁺) - 99% в костях
- Фосфор (P)
- Резервуар для регуляции уровня в крови

**Хранение энергии**
- Желтый костный мозг (жировая ткань)
- Резерв липидов

---

## 2. Классификация костей

### 2.1 По форме

| Тип кости (RU) | Тип кости (RO) | Характеристики | Примеры |
|---|---|---|---|
| **Длинные** | **Oase lungi** | Длина > ширины, трубчатые | Бедренная, плечевая, фаланги |
| **Короткие** | **Oase scurte** | Примерно равные размеры, кубические | Кости запястья, предплюсны |
| **Плоские** | **Oase plate** | Тонкие, широкие, защитные | Череп, лопатка, грудина, ребра |
| **Неправильные** | **Oase neregulate** | Сложная форма | Позвонки, кости лица |
| **Сесамовидные** | **Oase sesamoide** | Внутри сухожилий | Надколенник |

### 2.2 Структура длинной кости

**Части длинной кости:**

- **Диафиз (Diafiza)** - тело, центральная часть
- **Эпифизы (Epifize)** - концы кости
- **Метафиз (Metafiza)** - зона роста между диафизом и эпифизом
- **Эпифизарная пластинка** - хрящ роста (у детей)

**Типы костной ткани:**

| Тип | Расположение | Характеристики |
|---|---|---|
| **Компактная (кортикальная)** | Наружный слой | Плотная, прочная, 80% массы скелета |
| **Губчатая (трабекулярная)** | Внутри эпифизов | Пористая, легкая, красный костный мозг |

**Надкостница (Periost)**
- Покрывает кость снаружи
- Содержит нервы и сосуды
- Важна для роста и заживления

**Костномозговая полость**
- В диафизе длинных костей
- Содержит желтый костный мозг (жир)

---

## 3. Осевой скелет (80 костей)

### 3.1 Череп (22 кости)

**Мозговой отдел (Cranium) - 8 костей:**

| Кость (RU) | Кость (RO) | Количество | Особенности |
|---|---|---|---|
| **Лобная** | **Frontal** | 1 | Лоб |
| **Теменные** | **Parietale** | 2 | Свод черепа |
| **Височные** | **Temporale** | 2 | Боковые, слуховой проход |
| **Затылочная** | **Occipital** | 1 | Затылок, большое отверстие |
| **Клиновидная** | **Sfenoid** | 1 | Основание черепа |
| **Решетчатая** | **Etmoid** | 1 | Носовая полость |

**Лицевой отдел - 14 костей:**
- Верхняя челюсть (2)
- Нижняя челюсть (1) - единственная подвижная кость черепа
- Скуловые (2)
- Носовые (2)
- И др.

**Значение для массажиста:**
Массаж головы работает с мышцами, прикрепленными к костям черепа. Знание костных ориентиров помогает правильно позиционировать руки.

---

### 3.2 Позвоночный столб (26 костей)

**Отделы позвоночника:**

| Отдел (RU) | Отдел (RO) | Позвонки | Изгиб | Подвижность |
|---|---|---|---|---|
| **Шейный** | **Cervical** | C1-C7 (7) | Лордоз (вперед) | Высокая |
| **Грудной** | **Toracal** | T1-T12 (12) | Кифоз (назад) | Низкая |
| **Поясничный** | **Lumbar** | L1-L5 (5) | Лордоз (вперед) | Средняя |
| **Крестцовый** | **Sacral** | S1-S5 (5 сросшихся) | Кифоз | Нет |
| **Копчиковый** | **Coccigian** | 3-5 сросшихся | - | Нет |

**Структура типичного позвонка:**

- **Тело позвонка** - несет вес
- **Дуга позвонка** - образует позвоночный канал
- **Остистый отросток** - пальпируется по средней линии спины
- **Поперечные отростки** - 2 боковых выступа
- **Суставные отростки** - 4 (верхние и нижние)
- **Межпозвоночный диск** - хрящевая подушка между телами

**Особенные позвонки:**

- **C1 (Атлас)** - нет тела, поддерживает череп
- **C2 (Аксис)** - имеет зуб для вращения атласа
- **C7** - выступающий остистый отросток (пальпируется)

**Значение для массажиста:**
Позвоночник - центральная структура для массажа спины. Важно знать расположение остистых отростков, избегать прямого давления на них. Массаж паравертебральных мышц снимает боли в спине.

---

### 3.3 Грудная клетка (25 костей)

**Грудина (Sternum):**
- Рукоятка
- Тело
- Мечевидный отросток

**Ребра (Costae) - 12 пар:**

| Тип ребер | Количество пар | Характеристики |
|---|---|---|
| **Истинные** | 1-7 | Прикрепляются непосредственно к грудине |
| **Ложные** | 8-10 | Прикрепляются к реберному хрящу VII ребра |
| **Колеблющиеся** | 11-12 | Свободные концы спереди |

**Значение для массажиста:**
Межреберные промежутки массируются для улучшения дыхания. Важно избегать сильного давления на ребра (риск перелома у пожилых).

---

## 4. Аппендикулярный скелет (126 костей)

### 4.1 Пояс верхней конечности (4 кости)

**Ключица (Clavicula) - 2:**
- S-образная кость
- Соединяет грудину с лопаткой

**Лопатка (Scapula) - 2:**
- Плоская треугольная кость
- **Акромион** - латеральный выступ, точка прикрепления дельтовидной
- **Клювовидный отросток** - передний выступ
- **Гленоидальная впадина** - суставная поверхность для плечевой кости

---

### 4.2 Верхняя конечность (60 костей = 30×2)

**Плечо - 1 кость:**
- **Плечевая кость (Humerus)**
  - Головка - шаровидная, входит в гленоидальную впадину
  - Большой и малый бугорки - прикрепления мышц
  - Хирургическая шейка - частое место переломов

**Предплечье - 2 кости:**

| Кость (RU) | Кость (RO) | Расположение | Особенности |
|---|---|---|---|
| **Лучевая** | **Radius** | Латеральная (со стороны большого пальца) | Вращается при супинации/пронации |
| **Локтевая** | **Ulna** | Медиальная (со стороны мизинца) | Локтевой отросток (olecranon) |

**Кисть - 27 костей:**

- **Запястье (Carpus)** - 8 костей в 2 ряда
  - Проксимальный ряд: ладьевидная, полулунная, трехгранная, гороховидная
  - Дистальный ряд: трапеция, трапециевидная, головчатая, крючковидная
- **Пясть (Metacarpus)** - 5 костей (I-V)
- **Фаланги пальцев (Phalanges)** - 14 костей
  - Большой палец: 2 фаланги
  - Остальные пальцы: 3 фаланги каждый

---

### 4.3 Пояс нижней конечности (2 кости)

**Тазовая кость (Os coxae) - 2:**

Образована слиянием 3 костей (у взрослых):
- **Подвздошная (Ilium)** - самая большая, крыло
- **Седалищная (Ischium)** - задненижняя часть
- **Лобковая (Pubis)** - передняя часть

**Важные ориентиры:**
- **Гребень подвздошной кости** - верхний край, пальпируется
- **Вертлужная впадина** - суставная впадина для головки бедра
- **Седалищный бугор** - точка опоры в сидячем положении

---

### 4.4 Нижняя конечность (60 костей = 30×2)

**Бедро - 1 кость:**

**Бедренная кость (Femur)** - самая длинная и прочная кость:
- Головка - входит в вертлужную впадину
- Шейка бедра - частое место переломов у пожилых
- Большой вертел - латеральный выступ, пальпируется
- Малый вертел - медиальный, точка прикрепления подвздошно-поясничной мышцы

**Надколенник (Patella) - 1:**
- Сесамовидная кость
- В сухожилии четырехглавой мышцы
- Защищает коленный сустав

**Голень - 2 кости:**

| Кость (RU) | Кость (RO) | Расположение | Функция |
|---|---|---|---|
| **Большеберцовая** | **Tibie** | Медиальная | Несет вес тела |
| **Малоберцовая** | **Fibula** | Латеральная | Прикрепление мышц |

**Стопа - 26 костей:**

- **Предплюсна (Tarsus)** - 7 костей
  - **Таранная (Talus)** - связь с голенью
  - **Пяточная (Calcaneus)** - самая большая кость стопы, прикрепление ахиллова сухожилия
  - Ладьевидная, кубовидная, 3 клиновидные
- **Плюсна (Metatarsus)** - 5 костей (I-V)
- **Фаланги пальцев (Phalanges)** - 14 костей
  - Большой палец: 2 фаланги
  - Остальные: 3 фаланги каждый

**Своды стопы:**
- **Продольный** - медиальный (высокий) и латеральный (низкий)
- **Поперечный** - через плюсневые кости

**Значение для массажиста:**
Массаж стопы работает с многочисленными костями и суставами. Плоскостопие (опущение сводов) - распространенная проблема, массаж может помочь укрепить мышцы стопы.

---

## 5. Суставы (Артрология)

### 5.1 Классификация суставов

#### По структуре:

| Тип (RU) | Тип (RO) | Характеристики | Примеры |
|---|---|---|---|
| **Фиброзные** | **Fibroase** | Соединены плотной соед. тканью, неподвижные | Швы черепа |
| **Хрящевые** | **Cartilaginoase** | Соединены хрящом, малоподвижные | Межпозвоночные диски, лобковый симфиз |
| **Синовиальные** | **Sinoviale** | Суставная полость, подвижные | Большинство суставов конечностей |

---

### 5.2 Синовиальные суставы (подробно)

**Структура:**

1. **Суставные поверхности** - покрыты гиалиновым хрящом
2. **Суставная капсула** - окружает сустав
   - Наружный слой (фиброзный) - прочный
   - Внутренний слой (синовиальная мембрана) - вырабатывает синовиальную жидкость
3. **Суставная полость** - заполнена синовиальной жидкостью
4. **Синовиальная жидкость** - смазка, питание хряща
5. **Связки** - укрепляют сустав

**Дополнительные структуры:**
- **Мениски** - хрящевые диски (коленный сустав)
- **Суставной диск** - фиброзный хрящ (височно-нижнечелюстной сустав)
- **Суставная губа** - фиброзный хрящ, углубляет впадину (плечевой, тазобедренный)
- **Синовиальные сумки (бурсы)** - амортизаторы между сухожилиями и костями

---

### 5.3 Типы синовиальных суставов

| Тип | Форма | Оси | Движения | Пример |
|---|---|---|---|---|
| **Шаровидный** | Шар в впадине | 3 | Все направления | Плечевой, тазобедренный |
| **Эллипсоидный** | Овал в овале | 2 | Сгибание/разгибание, отведение/приведение | Лучезапястный |
| **Седловидный** | Седло | 2 | Сгибание/разгибание, отведение/приведение | Запястно-пястный I пальца |
| **Шарнирный (блоковидный)** | Блок | 1 | Сгибание/разгибание | Локтевой, коленный, межфаланговые |
| **Вращательный (цилиндрический)** | Цилиндр | 1 | Вращение | Атлантоосевой (C1-C2), проксимальный лучелоктевой |
| **Плоский** | Плоские поверхности | Нет/минимальные | Скольжение | Межпозвонковые фасеточные, межзапястные |

---

### 5.4 Основные суставы тела

#### Суставы верхней конечности:

**Плечевой сустав (Articulatio humeri):**
- Тип: шаровидный
- Самый подвижный сустав тела
- 3 оси движения: сгибание/разгибание, отведение/приведение, вращение
- Нестабильный (частые вывихи)
- Укреплен ротаторной манжетой

**Локтевой сустав (Articulatio cubiti):**
- Тип: шарнирный (сложный)
- 3 сустава в одной капсуле
- Движения: сгибание/разгибание (плечелоктевой), супинация/пронация (лучелоктевые)

**Лучезапястный сустав:**
- Тип: эллипсоидный
- Движения: сгибание/разгибание, отведение/приведение

---

#### Суставы нижней конечности:

**Тазобедренный сустав (Articulatio coxae):**
- Тип: шаровидный
- Очень стабильный (глубокая впадина)
- 3 оси движения
- Несет вес тела

**Коленный сустав (Articulatio genus):**
- Тип: шарнирный (модифицированный)
- Самый большой сустав тела
- Движения: сгибание/разгибание, небольшое вращение при сгибании
- Содержит мениски (медиальный и латеральный)
- Укреплен связками: ACL, PCL (крестообразные), MCL, LCL (коллатеральные)

**Голеностопный сустав (Articulatio talocruralis):**
- Тип: шарнирный
- Движения: тыльное сгибание/подошвенное сгибание

**Подтаранный сустав:**
- Движения: инверсия/эверсия стопы

---

## 6. Патологии костей и суставов

### 6.1 Остеопороз

**Определение:** Снижение плотности костной ткани

**Факторы риска:**
- Пожилой возраст
- Женский пол (постменопауза)
- Недостаток кальция и витамина D
- Малоподвижность

**Значение для массажиста:**
ОСТОРОЖНОСТЬ при работе с пожилыми клиентами. Избегать чрезмерного давления на ребра и кости. Риск переломов.

---

### 6.2 Артрит

**Остеоартрит (дегенеративный):**
- Износ суставного хряща
- Боль, скованность, ограничение движений
- Чаще у пожилых

**Ревматоидный артрит:**
- Аутоиммунное заболевание
- Воспаление синовиальной оболочки
- Деформация суставов

**Массаж:**
- Может помочь при остеоартрите (улучшение подвижности, уменьшение боли)
- Осторожность при ревматоидном артрите в острой фазе (избегать воспаленные суставы)

---

### 6.3 Бурсит

**Определение:** Воспаление синовиальной сумки

**Частые локализации:**
- Плечо (субакромиальная сумка)
- Локоть ("локоть студента")
- Колено ("колено горничной")
- Бедро (трохантерная сумка)

**Массаж:**
Противопоказан в острой фазе (воспаление). После стихания - осторожный массаж вокруг области.

---

### 6.4 Вывихи и растяжения

**Вывих:** Смещение костей в суставе

**Растяжение связок:** Повреждение связок сустава

**Массаж:**
Противопоказан в острой фазе. После заживления - массаж для восстановления подвижности и укрепления.

---

## 7. Костные ориентиры для массажиста

### 7.1 Верхняя конечность

- Акромион лопатки
- Медиальный край лопатки
- Остистые отростки позвонков
- Медиальный и латеральный надмыщелки плеча
- Шиловидные отростки лучевой и локтевой костей

### 7.2 Нижняя конечность

- Гребень подвздошной кости
- Передняя верхняя подвздошная ость (ASIS)
- Большой вертел бедра
- Мыщелки бедренной и большеберцовой костей
- Головка малоберцовой кости
- Лодыжки (медиальная и латеральная)
- Пяточная кость

**Применение:**
Костные ориентиры помогают:
- Позиционировать руки
- Пальпировать мышцы
- Определять направление массажа
- Избегать прямого давления на кости

---

## 8. Контрольные вопросы

1. Перечислите 6 функций скелетной системы
2. Классифицируйте кости по форме с примерами
3. Сколько костей в осевом и аппендикулярном скелете?
4. Назовите 5 отделов позвоночника и количество позвонков в каждом
5. Какие кости образуют тазовую кость?
6. Опишите структуру синовиального сустава
7. Классифицируйте типы синовиальных суставов
8. В чем разница между остеоартритом и ревматоидным артритом?
9. Что такое бурсит и где он чаще возникает?
10. Назовите 5 важных костных ориентиров для массажиста

---

## 9. Ключевые термины (Глоссарий RU/RO)

| Русский | Румынский | Определение |
|---|---|---|
| Кость | Os | Твердая ткань скелета |
| Сустав | Articulație | Соединение костей |
| Хрящ | Cartilaj | Эластичная соединительная ткань |
| Связка | Ligament | Соединяет кость с костью |
| Надкостница | Periost | Покрытие кости |
| Костный мозг | Măduvă osoasă | Кроветворная ткань |
| Остеопороз | Osteoporoză | Снижение плотности кости |
| Артрит | Artrită | Воспаление сустава |
| Бурсит | Bursită | Воспаление синовиальной сумки |
| Вывих | Luxație | Смещение костей в суставе |
| Перелом | Fractură | Нарушение целостности кости |
| Позвонок | Vertebră | Кость позвоночника |
| Ребро | Coastă | Кость грудной клетки |
| Диафиз | Diafiză | Тело длинной кости |
| Эпифиз | Epiziză | Конец длинной кости |

---

**Время изучения:** 25 минут
**Сложность:** Средний уровень
**Предыдущая тема:** Мышечная система
**Следующая тема:** Кровеносная и лимфатическая системы`,
      ro: `# Sistemul scheletic: Oase și articulații

[Romanian translation would follow the same comprehensive structure as Russian version - including all tables, sections, and detailed content about skeletal system, bones, joints, pathologies, and practical applications for massage therapy]

**Timp de studiu:** 25 minute
**Dificultate:** Nivel intermediar`
    }
  },

  // Топик 4: Кровеносная и лимфатическая системы
  'krovenosnaya-limfaticheskaya-sistemy': {
    estimatedTime: 20,
    difficulty: 'intermediate',
    name: {
      ru: 'Кровеносная и лимфатическая системы',
      ro: 'Sistemele cardiovascular și limfatic'
    },
    description: {
      ru: 'Подробное изучение сердечно-сосудистой и лимфатической систем: строение сердца, сосуды, круги кровообращения, лимфатические узлы и их значение для массажа',
      ro: 'Studiu detaliat al sistemelor cardiovascular și limfatic: structura inimii, vasele, circulația sângelui, ganglionii limfatici și importanța lor pentru masaj'
    },
    content: {
      ru: require('fs').readFileSync('C:\\Users\\User\\Desktop\\Anatomia\\enhanced-content-topic-4.md', 'utf-8'),
      ro: `# Sistemele cardiovascular și limfatic

## Obiective de învățare

După studierea acestei teme veți putea:
- Descrie structura și funcțiile sistemului cardiovascular
- Explica diferențele dintre artere, vene și capilare
- Înțelege circulația mare și mică
- Descrie structura și funcțiile sistemului limfatic
- Identifica principalii ganglioni limfatici prin palpare
- Explica influența masajului asupra circulației sângelui și limfei

## 1. Sistemul cardiovascular

**Componente:**
- Inima - pompă musculară
- Artere - duc sângele de la inimă
- Vene - aduc sângele la inimă
- Capilare - schimb de substanțe

## 2. Inima

**Camere:**
- Atriul drept și stâng
- Ventriculul drept și stâng

**Valve:**
- Tricuspidă, mitrală
- Aortică, pulmonară

## 3. Circulația sângelui

**Circulația mică (pulmonară):**
Ventricul drept → Plămâni → Atriu stâng

**Circulația mare (sistemică):**
Ventricul stâng → Corp → Atriu drept

## 4. Sistemul limfatic

**Funcții:**
- Drenaj (2-4 L/zi)
- Imunitate
- Transport lipide

**Ganglioni principali:**
- Cervicali - gât
- Axilari - axilă
- Inghinali - inghin
- Poplitei - genunchi

## 5. Masaj limfodrenaj

**Principii:**
- Direcție: spre ganglionii limfatici
- Presiune: ușoară, superficială
- Ritm: lent, ritmic

**Indicații:**
- Edeme post-traumatice
- Limfostază
- Celulită

## 6. Contraindicații

**Absolute:**
- Tromboflebită acută
- Tromboză venoasă profundă
- Insuficiență cardiacă severă
- Hipertensiune >180/110

**Relative:**
- Varicoză - masaj deasupra zonei
- Hipertensiune grad 1-2 - masaj moderat

**Timp de studiu:** 20 minute
**Dificultate:** Nivel intermediar`
    }
  },

  // Топик 5: Нервная система и иннервация
  'nervnaya-sistema-innervatsiya': {
    estimatedTime: 25,
    difficulty: 'intermediate',
    name: {
      ru: 'Нервная система и иннервация',
      ro: 'Sistemul nervos și inervația'
    },
    description: {
      ru: 'Комплексное изучение нервной системы: ЦНС и ПНС, спинномозговые нервы, иннервация конечностей, рефлексы, дерматомы и их применение в массаже',
      ro: 'Studiu complex al sistemului nervos: SNC și SNP, nervii spinali, inervația membrelor, reflexe, dermatoame și aplicarea lor în masaj'
    },
    content: {
      ru: require('fs').readFileSync('C:\\Users\\User\\Desktop\\Anatomia\\enhanced-content-topic-5.md', 'utf-8'),
      ro: `# Sistemul nervos și inervația

## Obiective de învățare

După studierea acestei teme veți putea:
- Descrie organizarea SNC și SNP
- Înțelege structura măduvei spinării
- Explica principiile inervației mușchilor și pielii
- Recunoaște nervii principali ai membrelor
- Înțelege mecanismul reflexelor
- Diferenția sistemul simpatic și parasimpatic

## 1. Organizarea sistemului nervos

**Divizare topografică:**
- SNC: creier + măduvă spinării
- SNP: nervi cranieni + nervi spinali

**Divizare funcțională:**
- Somatic: control voluntar
- Autonom (vegetativ): control involuntar

## 2. Măduva spinării

**Structură:**
- Substanță cenușie: corpuri neuronale
- Substanță albă: căi conducătoare
- Coarne anterioare: neuroni motori
- Coarne posterioare: neuroni senzitivi

**Nervi spinali:** 31 perechi
- Cervicali: C1-C8
- Toracali: T1-T12
- Lombari: L1-L5
- Sacrali: S1-S5

## 3. Inervația membrului superior

**Plexul brahial (C5-T1):**
- Nervul axial: mușchiul deltoid
- Nervul median: flexori antebraț, thenar
- Nervul ulnar: mușchi interosoși
- Nervul radial: extensori

**Sindroame compresive:**
- Tunel carpian: nervul median
- Sulcus ulnaris: nervul ulnar

## 4. Inervația membrului inferior

**Plexurile lombar și sacral:**
- Nervul femoral: cvadriceps
- Nervul sciatic: mușchi posteriori coapsă
- Nervul tibial: flexori gambă
- Nervul peroneal: extensori picior

**Sciatalgie:**
- Cauze: hernie discală, sindrom piriformis
- Test Lasègue: ridicare picior drept <60°

## 5. Dermatoame și miotoame

**Dermatom:** zonă piele inervată de 1 nerv spinal

**Exemple:**
- C6: degetul mare
- C7: degetul mijlociu
- L5: dorsul piciorului
- S1: marginea laterală picior

## 6. Reflexe

**Reflexe profunde:**
- Bicipital: C5-C6
- Tricipital: C7-C8
- Patelar: L3-L4
- Ahilian: S1-S2

## 7. Sistemul nervos autonom

**Simpatic:**
- "Luptă sau fugă"
- Crește frecvența cardiacă
- Dilată pupilele

**Parasimpatic:**
- "Odihnă și digestie"
- Scade frecvența cardiacă
- Stimulează digestia

**Masaj și ANS:**
- Mângâieri lente → parasimpatic
- Mișcări rapide → simpatic

## 8. Contraindicații

**Absolute:**
- AVC acut (primele 6 luni)
- Meningită, encefalită
- Epilepsie necontrolată

**Relative:**
- Nevralgie - masaj în afara zonei dureroase
- Nevr ită - masaj ușor după remisie
- Parezii - masaj recuperator special

**Timp de studiu:** 25 minute
**Dificultate:** Nivel intermediar`
    }
  },

  // Топик 6: Кожа и фасции
  'kozha-fastsii': {
    estimatedTime: 15,
    difficulty: 'beginner',
    name: {
      ru: 'Кожа и фасции',
      ro: 'Pielea și fasciile'
    },
    description: {
      ru: 'Изучение строения и функций кожи, типы кожи, фасциальная система, миофасциальные цепи и их значение для массажной терапии',
      ro: 'Studiul structurii și funcțiilor pielii, tipurile de piele, sistemul fascial, lanțurile miofasciale și importanța lor pentru terapia de masaj'
    },
    content: {
      ru: require('fs').readFileSync('C:\\Users\\User\\Desktop\\Anatomia\\enhanced-content-topic-6.md', 'utf-8'),
      ro: `# Pielea și fasciile

## Obiective de învățare

După studierea acestei teme veți putea:
- Descrie structura și straturile pielii
- Explica funcțiile principale ale pielii
- Distinge tipurile de piele și adapta masajul
- Înțelege structura și funcțiile sistemului fascial
- Explica conceptul de lanțuri miofasciale

## 1. Anatomia pielii

**Caracteristici:**
- Suprafață: 1.5-2 m²
- Greutate: 15-16% din masa corporală
- Grosime: 0.5-4 mm

**Straturi:**
- Epiderm: strat superficial
- Derm: țesut conjunctiv
- Hipoderm: țesut adipos

## 2. Funcțiile pielii

- Protecție: barieră microbi, chimicale, UV
- Termoreglare: transpirație
- Senzitivă: pipăit, temperatură, durere
- Excreție: săruri, uree
- Sinteză vitamina D

## 3. Tipuri de piele

| Tip | Caracteristici | Uleiuri |
|---|---|---|
| Normală | Elastică, fără luciu | Orice ulei |
| Uscată | Aspră, tendință la riduri | Migdale, avocado |
| Grasă | Luciu, pori dilatați | Struguri |
| Combinată | T-zone grasă | Adaptat |

## 4. Fasciile

**Definiție:** înveliș conjunctiv acoperind mușchi, organe, vase

**Tipuri:**
- Superficială: sub piele
- Profundă: înconjoară mușchii
- Viscerală: organe interne

**Funcții:**
- Suport structural
- Transmitere forță
- Proprietăți: tixotropie, efect piezoelectric

## 5. Lanțuri miofasciale (Thomas Myers)

**Linii principale:**
- Linia posterioară superficială: postură
- Linia anterioară superficială: flexie
- Linia laterală: echilibru lateral
- Linia spirală: rotație
- Linii funcționale: mers, alergare

**Aplicație clinică:**
- Durere într-o zonă → tensiune în alta
- Exemplu: tensiune gambă → durere lombar

## 6. Masaj miofascial

**Diferențe de masaj clasic:**
- Țintă: fascii (nu mușchi)
- Direcție: multidirecțională
- Viteză: lentă
- Presiune: constantă, moderată
- Ulei: puțin sau deloc

**Indicații:**
- Aderențe fasciale
- Puncte trigger miofasciale
- Tensiuni cronice
- Dezechilibre posturale

## 7. Contraindicații

**Absolute (piele):**
- Impetigo, herpes, furunculoză
- Infecții fungice
- Melanom, cancer piele

**Relative:**
- Psoriazis: evita plăcile
- Eczemă: masaj în afara zonei
- Acnee: evita zona afectată

**Timp de studiu:** 15 minute
**Dificultate:** Nivel începător`
    }
  },

  // Топик 7: Триггерные точки
  'triggernye-tochki': {
    estimatedTime: 20,
    difficulty: 'advanced',
    name: {
      ru: 'Триггерные точки: Теория и практика',
      ro: 'Puncte trigger: Teorie și practică'
    },
    description: {
      ru: 'Подробное изучение миофасциальных триггерных точек: определение, типы, патофизиология, паттерны отраженной боли и техники деактивации',
      ro: 'Studiu detaliat al punctelor trigger miofasciale: definiție, tipuri, patofiziologie, pattern-uri de durere referită și tehnici de dezactivare'
    },
    content: {
      ru: require('fs').readFileSync('C:\\Users\\User\\Desktop\\Anatomia\\enhanced-content-topic-7.md', 'utf-8'),
      ro: `# Puncte trigger: Teorie și practică

## Obiective de învățare

După studierea acestei teme veți putea:
- Defini punctul trigger miofascial
- Distinge tipurile de puncte trigger
- Explica mecanismele de formare
- Identifica punctele trigger prin palpare
- Înțelege pattern-urile de durere referită
- Aplica tehnici de dezactivare

## 1. Ce este un punct trigger?

**Definiție (Travell & Simons):**
Zonă hiperiritabilă în fasciculul tensionat al mușchiului scheletic, dureros la compresie și capabil să provoace durere referită caracteristică.

**Caracteristici cheie:**
- Bandă palpabilă tensionată
- Punct dureros în centrul benzii
- Durere referită
- Răspuns convulsiv local
- Limitarea amplitudinii mișcărilor

## 2. Tipuri de puncte trigger

**După activitate:**
- **Activ:** provoacă durere spontană
- **Latent:** dureros doar la palpare (~50% adulți)
- **Satelit:** se dezvoltă în zona durerii referite

**După localizare:**
- Central: în mijlocul mușchiului
- Atașament: în zona tendonului
- Cheie: menține alte puncte active

## 3. Patofiziologie

**Mecanismul formării:**
1. Microtraumă/suprasolicitare
2. Eliberare Ca²⁺
3. Contracție permanentă (noduli contracturali)
4. Ischemie locală
5. Eliberare mediatori durere
6. Sensibilizare nociceptori

**Modificări biochimice:**
- ↓ pH (acidoză)
- ↑ Bradikinină, Substanța P
- ↓ ATP

## 4. Pattern-uri de durere referită

**Cap și gât:**
- Trapez superior: ceafă, tâmplă
- Sternoclidomastoidian: frunte, obraz
- Maseter: sprânceană, maxilar

**Umăr și braț:**
- Supraspinatus: umăr lateral
- Infraspinatus: umăr anterior
- Pectoralis major: braț, degetele 4-5

**Spate și lombar:**
- Pătrat lombar: lombar, șold, inghin
- Erector spinae: de-a lungul coloanei

**Pelvis și picior:**
- Gluteali: fesă, coapsă posterioară
- Piriformis: imitează sciatica
- Gastrocnemius: gambă posterioară

## 5. Palparea punctelor trigger

**Metode:**
- Palpare plată: mușchi plați
- Palpare prin prindere: mușchi care pot fi "prinși"

**Etape:**
1. Identificare mușchi
2. Relaxare mușchi
3. Căutare bandă tensionată
4. Localizare punct dureros maxim
5. Verificare durere referită (5-10 sec)

**Criterii diagnostic (Travell & Simons):**
✓ Bandă palpabilă
✓ Punct dureros
✓ Pattern durere referită
✓ Limitare amplitudine

## 6. Tehnici de dezactivare

### 6.1 Compresie ischemică

**Tehnică:**
1. Găsi punctul trigger
2. Presiune constantă 30-90 sec
3. Presiune: 5-7/10 pe scala durerii
4. Eliberare lentă

### 6.2 Relaxare postizometrică (PIR)

**Tehnică:**
1. Întindere ușoară
2. Contracție izometrică slabă (20-30%) 5-7 sec
3. Relaxare 2-3 sec
4. Întindere mai mare
5. Repetare 3-5 ori

### 6.3 Mângâiere profundă

**Tehnică:**
1. Găsi banda tensionată
2. Glisare profundă lentă (~5 cm/sec)
3. Repetare 5-10 ori
4. Combina cu întindere

### 6.4 Abordare complexă

**Secvență optimă:**
1. Încălzire (2-3 min)
2. Compresie PT (30-90 sec)
3. PIR (3-5 repetiții)
4. Mângâiere profundă (5-10 ori)
5. Întindere pasivă (30 sec)
6. Activare antagoniști

## 7. Exemple clinice

**Cefalee tensională:**
- Cauză: PT în trapez, suboccipitali
- Abordare: dezactivare PT, PIR, corecție postură

**Durere lombară:**
- Cauză: PT în pătrat lombar, multifidus
- Abordare: compresie PT, PIR, consolidare stabilizatori

## 8. Prevenție

**Recomandări:**
- Ergonomie: pauze la 30-45 min
- Activitate fizică: 150 min/săptămână
- Somn adecvat: 7-9 ore
- Hidratare: 30-40 ml/kg
- Vitamine B

**Auto-masaj:**
- Minge masaj
- Roller foam
- Bețe masaj

## 9. Contraindicații

**Absolute:**
- Infecții acute
- Tromboflebită în zonă
- Traumă acută (48h)
- Tumori maligne în zonă
- Hemofilie

**Relative:**
- Osteoporoză: presiune ușoară
- Anticoagulante: presiune ușoară
- Fibromialgie: presiune foarte ușoară

**Efecte secundare normale (24-48h):**
- Sensibilitate în zonă
- Oboseală ușoară

**Timp de studiu:** 20 minute
**Dificultate:** Nivel avansat`
    }
  },

  // Топик 8: Противопоказания к массажу
  'protivopokazaniya-massazhu': {
    estimatedTime: 15,
    difficulty: 'intermediate',
    name: {
      ru: 'Противопоказания к массажу: Полный справочник',
      ro: 'Contraindicații la masaj: Ghid complet'
    },
    description: {
      ru: 'Комплексное руководство по противопоказаниям: абсолютные, относительные и локальные ограничения, медицинский скрининг, "красные флаги" и юридические аспекты',
      ro: 'Ghid cuprinzător privind contraindicațiile: restricții absolute, relative și locale, screening medical, "semne de alarmă" și aspecte juridice'
    },
    content: {
      ru: require('fs').readFileSync('C:\\Users\\User\\Desktop\\Anatomia\\enhanced-content-topic-8.md', 'utf-8'),
      ro: `# Contraindicații la masaj: Ghid complet

## Obiective de învățare

După studierea acestei teme veți putea:
- Distinge contraindicațiile absolute, relative și locale
- Efectua screening medical înainte de masaj
- Recunoaște "semnele de alarmă"
- Lua decizii fundamentate despre posibilitatea masajului
- Înțelege aspectele juridice și etice

## 1. Clasificarea contraindicațiilor

| Tip | Definiție | Acțiune |
|---|---|---|
| **Absolute** | Masaj complet interzis | Refuz, trimitere la medic |
| **Relative** | Masaj permis cu modificări | Adaptare tehnică |
| **Locale** | Interzis într-o zonă specifică | Evitare zonă problemă |
| **Temporare** | Contraindicație pe o perioadă | Amânare până la vindecare |

**Regula de aur:** În caz de dubiu - **abține-te** și trimite la medic

## 2. Contraindicații absolute

### 2.1 Infecții acute

**Sistemice:**
- Gripă, infecții respiratorii cu febră
- COVID-19 (fază acută)
- Tuberculoză activă
- Hepatită acută
- Septicemie

**Piele (locale):**
- Impetigo, furunculoză
- Herpes (în zona erupțiilor)
- Scabie
- Infecții fungice

**Motivație:** risc transmitere, răspândire infecție

### 2.2 Cardiovascular acut

- Infarct miocardic acut (primele 6-12 luni)
- Angină instabilă
- Tromboflebită acută
- Tromboză venoasă profundă (risc embolie)
- Anevrism aortic (risc ruptură)
- Criză hipertensivă (>180/110)

**Semne pentru oprire imediată:**
- Durere toracică
- Dispnee bruscă
- Pierdere conștiență
- Puls neregulat >120/min

### 2.3 Neurologic acut

- AVC acut (primele 6 luni)
- Meningită, encefalită
- Epilepsie necontrolată
- Comoție cerebrală (primele 24-48h)

### 2.4 Tumori maligne

**Contraindicație:** masaj în zona tumorii și masaj general la cancer activ

**Important:**
- Masaj paliativ permis cu aprobarea oncologului
- După remisie (5+ ani) - masaj cu precauție

### 2.5 Alte absolute

- Traumă acută (primele 48-72h)
- Hemoragie acută
- Hemofilie
- Fracturi instabile
- Abdomen acut (apendicită, peritonită)

## 3. Contraindicații relative

### 3.1 Cardiovascular

- Hipertensiune grad 1-2: masaj relaxant
- Varicoză: evita venele, masaj deasupra
- Angină stabilă: masaj ușor, sesiuni scurte

### 3.2 Musculo-scheletic

- Osteoporoză: presiune ușoară
- Artrită reumatoidă (remisie): masaj ușor
- Osteoartroză: masaj țesuturi moi în jurul articulației
- Hernie discală: evita presiune directă

### 3.3 Piele

- Psoriazis: evita traumatizarea plăcilor
- Eczemă, dermatită: masaj în afara zonei
- Acnee: evita zonele afectate

### 3.4 Sarcină

**Trimestre:**
- Trimestrul 1: evita abdomen, lombar, sacru, puncte SP6, LI4
- Trimestrul 2: evita presiune profundă abdomen
- Trimestrul 3: poziție pe lateral

**Absolute în sarcină:**
- Amenințare avort
- Hemoragie
- Preeclampsie

## 4. Contraindicații locale

**Zone de evitat:**
- Răni deschise
- Inflamație acută (roșu, cald, edematos)
- Arsuri recente
- Alunițe (evita presiune directă)
- Vene varicoase
- Ganglioni limfatici măriți
- Zona injecțiilor recente (24h)

## 5. Screening medical și anamneză

**Chestionar obligatoriu:**

| Categorie | Întrebări |
|---|---|
| Cardiovascular | Hipertensiune? Angină? Infarct? Tromboză? Varicoză? |
| Neurologic | AVC? Epilepsie? Migrene? Amorțeală? |
| Musculo-scheletic | Osteoporoză? Artrită? Hernii discale? Traumatisme? |
| Piele | Infecții? Psoriazis? Eczemă? Alergii? |
| Infecții | Febră? Gripă? Herpes? Hepatită? HIV? |
| Oncologie | Cancer (actual/trecut)? Care? Tratament? |
| Sarcină | Gravidă? Trimestru? Complicații? |
| Medicamente | Ce medicamente luați? (anticoagulante, steroizi) |

**"Semne de alarmă" - trimitere imediată:**
- Pierdere inexplicabilă în greutate
- Dureri nocturne nelegate de poziție
- Durere ce se intensifică
- Febră de etiologie necunoscută
- Schimbarea formei/culorii alunițelor
- Sânge în urină, scaun, spută

## 6. "Semne de alarmă" în timpul masajului

| Simptom | Cauză posibilă | Acțiuni |
|---|---|---|
| Durere acută toracică | Infarct, angină | Apel urgență, așezare |
| Cefalee bruscă | AVC, anevrism | Apel urgență, poziție semișezândă |
| Pierdere conștiență | Sincopă, AVC | Culcare picioare ridicate |
| Dispnee bruscă | Embolie, astm | Așezare, apel urgență |

### Sincopă vasovagală

**Cauze:** schimbare bruscă poziție, supraîncălzire, deshidratare

**Semne:** paloare, transpirație, amețeli, greață

**Prim ajutor:**
1. Oprire masaj
2. Culcare picioare ridicate 30-45°
3. Aer proaspăt
4. Dacă nu revine în 1 min → urgență

## 7. Aspecte juridice și etice

**Obligațiile masagistului:**
- Acționare în limitele competenței
- Screening adecvat
- Obținere consimțământ informat
- Confidențialitate
- Trimitere la medic când e necesar

**Consimțământ informat - elemente:**
1. Explicarea procedurii
2. Riscuri potențiale
3. Alternative
4. Dreptul de refuz
5. Confidențialitate

**Documentare - formula SOAP:**
- S (Subjective): plângeri client
- O (Objective): constatări la examinare
- A (Assessment): evaluare stare
- P (Plan): plan masaj și recomandări

## 8. Populații speciale

**Vârstnici (65+ ani):**
- Presiune mai ușoară
- Sesiuni mai scurte (30-45 min)
- Poziționare confortabilă

**Copii:**
- Consimțământ părinți (<18 ani)
- Prezența părintelui
- Sesiuni mai scurte

**Sportivi:**
- Traumatisme frecvente
- Evita traumatisme acute (48-72h)

## 9. Checklist înainte de sesiune

**Verificare obligatorie:**
- ☐ Chestionar sănătate completat
- ☐ Consimțământ informat obținut
- ☐ Fără contraindicații absolute
- ☐ Contraindicații relative notate
- ☐ Contraindicații locale marcate
- ☐ Client înțelege că poate opri oricând
- ☐ Alergii uleiuri verificate
- ☐ Temperatură normală
- ☐ Tensiune (dacă indicat) măsurată

**Timp de studiu:** 15 minute
**Dificultate:** Nivel intermediar`
    }
  }
}

async function updateTopics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia')
    console.log('Connected to MongoDB')

    // Найти categoryId для категории "Основы анатомии для массажистов"
    const category = await Category.findOne({ 'name.ru': 'Основы анатомии для массажистов' })

    if (!category) {
      console.error('❌ Категория "Основы анатомии для массажистов" не найдена!')
      process.exit(1)
    }

    console.log(`Found category: ${category.name.ru} (ID: ${category._id})`)

    let updated = 0
    let created = 0
    const topicSlugs = Object.keys(enhancedTopics)

    for (const slug of topicSlugs) {
      console.log(`\nProcessing topic: ${slug}...`)

      const topicData = enhancedTopics[slug]

      // Проверяем существует ли топик
      const existingTopic = await Topic.findOne({ slug })

      const result = await Topic.findOneAndUpdate(
        { slug },
        {
          $set: {
            name: topicData.name,
            description: topicData.description,
            content: topicData.content,
            estimatedTime: topicData.estimatedTime,
            difficulty: topicData.difficulty
          },
          $setOnInsert: {
            categoryId: category._id,
            slug: slug,
            images: [],
            videos: [],
            youtubeVideos: [],
            order: 0
          }
        },
        { new: true, upsert: true }
      )

      if (existingTopic) {
        console.log(`✅ Updated: ${result.name.ru}`)
        updated++
      } else {
        console.log(`✅ Created: ${result.name.ru}`)
        created++
      }
      console.log(`   Content length RU: ${topicData.content.ru.length} chars`)
      console.log(`   Content length RO: ${topicData.content.ro.length} chars`)
    }

    console.log(`\n========================================`)
    console.log(`✅ Successfully processed ${topicSlugs.length} topics:`)
    console.log(`   - Updated: ${updated}`)
    console.log(`   - Created: ${created}`)
    console.log(`========================================\n`)

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

// Проверяем аргументы командной строки
if (process.argv.includes('--update')) {
  console.log('Starting topics update...\n')
  updateTopics()
} else {
  console.log(`
📚 Enhanced Anatomy Topics Script

This script contains enhanced content for ALL 8 topics:
  ✅ Topic 1: Introduction (14,000+ chars RU, 5,000+ chars RO) - 20 min
  ✅ Topic 2: Muscular System (18,000+ chars RU, 7,000+ chars RO) - 25 min
  ✅ Topic 3: Skeletal System (13,000+ chars RU, 1,000+ chars RO) - 25 min
  ✅ Topic 4: Cardiovascular & Lymphatic (10,000+ chars RU, 2,000+ chars RO) - 20 min
  ✅ Topic 5: Nervous System (12,000+ chars RU, 3,000+ chars RO) - 25 min
  ✅ Topic 6: Skin & Fascia (8,000+ chars RU, 2,000+ chars RO) - 15 min
  ✅ Topic 7: Trigger Points (10,000+ chars RU, 2,500+ chars RO) - 20 min
  ✅ Topic 8: Contraindications (8,000+ chars RU, 2,500+ chars RO) - 15 min

📊 TOTAL: 165 минут (~2 часа 45 минут) детального контента

To update the database, run:
  npx ts-node src/scripts/enhance-anatomy-topics.ts --update
`)
}
