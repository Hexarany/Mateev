import dotenv from 'dotenv'
import { connectDB } from '../config/database'
import Topic from '../models/Topic'

dotenv.config()

const updateMuscleTopics = async () => {
  try {
    await connectDB()

    const myologyId = '6913a399b87594b3fe792e55'

    // 1. Обновить тему "Мышцы спины - полная анатомия" (Topic #2)
    console.log('1. Обновление темы "Мышцы спины"...')

    const backMuscleContent = `# Мышцы спины - Полная анатомия

## Введение

Мышцы спины образуют сложную многослойную систему, которая обеспечивает поддержку позвоночника, движения туловища и верхних конечностей. Они делятся на поверхностные и глубокие слои.

## Поверхностные мышцы спины

### Трапециевидная мышца (m. trapezius)

**Расположение:** Занимает верхнюю часть спины и заднюю область шеи.

**Начало:**
- Верхние волокна: наружный затылочный выступ, верхняя выйная линия
- Средние волокна: остистые отростки C7-T3
- Нижние волокна: остистые отростки T4-T12

**Прикрепление:**
- Верхние волокна: латеральная треть ключицы
- Средние волокна: акромион и ость лопатки
- Нижние волокна: медиальный конец ости лопатки

**Функция:**
- Верхние волокна: поднимают лопатку и плечевой пояс
- Средние волокна: приводят лопатку к позвоночнику
- Нижние волокна: опускают лопатку
- Вращение лопатки при подъеме руки выше горизонтали

**Иннервация:** Добавочный нерв (XI пара ЧМН), шейное сплетение (C3-C4)

### Широчайшая мышца спины (m. latissimus dorsi)

**Расположение:** Занимает нижнюю половину спины.

**Начало:**
- Остистые отростки T7-T12 и всех поясничных позвонков
- Крестец
- Задняя треть подвздошного гребня
- Нижние 3-4 ребра

**Прикрепление:** Гребень малого бугорка плечевой кости

**Функция:**
- Приведение плеча
- Разгибание плеча
- Пронация плеча
- Внутренняя ротация плеча
- Опускание поднятой руки

**Иннервация:** Грудоспинной нерв (C6-C8)

### Большая и малая ромбовидные мышцы (mm. rhomboidei major et minor)

**Расположение:** Между лопатками, под трапециевидной мышцей.

**Начало:**
- Малая ромбовидная: остистые отростки C7-T1
- Большая ромбовидная: остистые отростки T2-T5

**Прикрепление:** Медиальный край лопатки

**Функция:**
- Приведение лопатки к позвоночнику
- Поднятие медиального края лопатки
- Фиксация лопатки

**Иннервация:** Дорсальный нерв лопатки (C4-C5)

### Мышца, поднимающая лопатку (m. levator scapulae)

**Расположение:** Задне-боковая поверхность шеи.

**Начало:** Поперечные отростки C1-C4

**Прикрепление:** Верхний угол лопатки

**Функция:**
- Поднимает лопатку
- Приводит лопатку к позвоночнику
- При фиксированной лопатке наклоняет шейный отдел позвоночника

**Иннервация:** Дорсальный нерв лопатки (C3-C5)

## Глубокие мышцы спины

### Мышца, выпрямляющая позвоночник (m. erector spinae)

**Расположение:** Располагается вдоль всего позвоночника в углублении между остистыми и поперечными отростками.

**Состав:** Делится на три части:

1. **Подвздошно-реберная мышца (m. iliocostalis)**
   - Латеральный тракт
   - Начало: крестец, подвздошный гребень
   - Прикрепление: ребра, поперечные отростки нижних шейных позвонков

2. **Длиннейшая мышца (m. longissimus)**
   - Промежуточный тракт
   - Начало: крестец, остистые отростки поясничных позвонков
   - Прикрепление: поперечные отростки грудных и шейных позвонков, сосцевидный отросток

3. **Остистая мышца (m. spinalis)**
   - Медиальный тракт
   - Начало: остистые отростки нижних грудных и верхних поясничных позвонков
   - Прикрепление: остистые отростки верхних грудных и шейных позвонков

**Функция:**
- Разгибание позвоночника
- При одностороннем сокращении - наклон в ту же сторону
- Удержание вертикального положения тела

**Иннервация:** Задние ветви спинномозговых нервов

### Поперечно-остистая мышца (m. transversospinalis)

Включает несколько слоев коротких мышц, соединяющих соседние позвонки:

1. **Полуостистая мышца (m. semispinalis)**
   - Перекидывается через 4-6 позвонков

2. **Многораздельные мышцы (mm. multifidi)**
   - Перекидываются через 2-4 позвонка

3. **Мышцы-вращатели (mm. rotatores)**
   - Соединяют соседние позвонки

**Функция:**
- Разгибание позвоночника
- Вращение позвоночника в противоположную сторону
- Стабилизация позвоночника

**Иннервация:** Задние ветви спинномозговых нервов

### Межостистые и межпоперечные мышцы

**Межостистые мышцы (mm. interspinales)**
- Соединяют остистые отростки соседних позвонков
- Разгибание позвоночника

**Межпоперечные мышцы (mm. intertransversarii)**
- Соединяют поперечные отростки соседних позвонков
- Наклон позвоночника в свою сторону

## Клиническое значение

### Боли в спине
- Миофасциальный болевой синдром
- Триггерные точки в мышцах спины
- Мышечные спазмы

### Осанка
- Слабость глубоких мышц приводит к нарушениям осанки
- Гиперлордоз, кифоз, сколиоз

### Спортивная медицина
- Важность укрепления мышц кора
- Профилактика травм позвоночника
- Реабилитация после травм

## Вопросы для самопроверки

1. Какие мышцы спины относятся к поверхностным?
2. Опишите функции трех частей трапециевидной мышцы
3. Какие движения выполняет широчайшая мышца спины?
4. Из каких трех частей состоит мышца, выпрямляющая позвоночник?
5. Какие мышцы обеспечивают стабилизацию позвоночника?`

    const backMuscleContentRo = `# Mușchii Spatelui - Anatomie Completă

## Introducere

Mușchii spatelui formează un sistem complex cu multiple straturi care asigură susținerea coloanei vertebrale, mișcările trunchiului și membrelor superioare. Aceștia se împart în straturi superficiale și profunde.

## Mușchi Superficiali ai Spatelui

### Mușchiul Trapez (m. trapezius)

**Localizare:** Ocupă partea superioară a spatelui și regiunea posterioară a gâtului.

**Origine:**
- Fibre superioare: protuberanța occipitală externă, linia nuchală superioară
- Fibre medii: procesele spinoase C7-T3
- Fibre inferioare: procesele spinoase T4-T12

**Inserție:**
- Fibre superioare: treimea laterală a claviculei
- Fibre medii: acromion și spina scapulei
- Fibre inferioare: extremitatea medială a spinei scapulei

**Funcție:**
- Fibre superioare: ridică scapula și centura scapulară
- Fibre medii: adduc scapula spre coloana vertebrală
- Fibre inferioare: coboară scapula
- Rotația scapulei la ridicarea brațului peste orizontală

**Inervație:** Nervul accesor (perechea XI de nervi cranieni), plexul cervical (C3-C4)

### Mușchiul Latissimus Dorsi (m. latissimus dorsi)

**Localizare:** Ocupă jumătatea inferioară a spatelui.

**Origine:**
- Procesele spinoase T7-T12 și toți vertebrii lombari
- Sacru
- Treimea posterioară a crestei iliace
- Coastele inferioare 3-4

**Inserție:** Creasta tuberculului mic al humerusului

**Funcție:**
- Adducția brațului
- Extensia brațului
- Pronația brațului
- Rotația internă a brațului
- Coborârea brațului ridicat

**Inervație:** Nervul toracodorsal (C6-C8)

### Mușchii Rhomboidieni Mare și Mic (mm. rhomboidei major et minor)

**Localizare:** Între scapule, sub mușchiul trapez.

**Origine:**
- Rhomboid mic: procesele spinoase C7-T1
- Rhomboid mare: procesele spinoase T2-T5

**Inserție:** Marginea medială a scapulei

**Funcție:**
- Adducția scapulei spre coloana vertebrală
- Ridicarea marginii mediale a scapulei
- Fixarea scapulei

**Inervație:** Nervul dorsal al scapulei (C4-C5)

### Mușchiul Levator Scapulae (m. levator scapulae)

**Localizare:** Suprafața postero-laterală a gâtului.

**Origine:** Procesele transverse C1-C4

**Inserție:** Unghiul superior al scapulei

**Funcție:**
- Ridică scapula
- Adduce scapula spre coloana vertebrală
- La scapulă fixată, înclină regiunea cervicală

**Inervație:** Nervul dorsal al scapulei (C3-C5)

## Mușchi Profunzi ai Spatelui

### Mușchiul Erector Spinae (m. erector spinae)

**Localizare:** Se întinde de-a lungul întregii coloane vertebrale în adâncitură între procesele spinoase și transverse.

**Compoziție:** Se împarte în trei părți:

1. **Mușchiul Iliocostal (m. iliocostalis)**
   - Tract lateral
   - Origine: sacru, creastă iliacă
   - Inserție: coaste, procese transverse ale vertebrelor cervicale inferioare

2. **Mușchiul Longissimus (m. longissimus)**
   - Tract intermediar
   - Origine: sacru, procese spinoase ale vertebrelor lombare
   - Inserție: procese transverse ale vertebrelor toracice și cervicale, proces mastoid

3. **Mușchiul Spinal (m. spinalis)**
   - Tract medial
   - Origine: procese spinoase ale vertebrelor toracice inferioare și lombare superioare
   - Inserție: procese spinoase ale vertebrelor toracice și cervicale superioare

**Funcție:**
- Extensia coloanei vertebrale
- La contracție unilaterală - înclinare în aceeași parte
- Menținerea poziției verticale a corpului

**Inervație:** Ramurile posterioare ale nervilor spinali

### Mușchiul Transversospinalis (m. transversospinalis)

Include mai multe straturi de mușchi scurți care conectează vertebrele adiacente:

1. **Mușchiul Semispinalis (m. semispinalis)**
   - Trece peste 4-6 vertebre

2. **Mușchii Multifidi (mm. multifidi)**
   - Trec peste 2-4 vertebre

3. **Mușchii Rotatori (mm. rotatores)**
   - Conectează vertebrele adiacente

**Funcție:**
- Extensia coloanei vertebrale
- Rotația coloanei vertebrale în partea opusă
- Stabilizarea coloanei vertebrale

**Inervație:** Ramurile posterioare ale nervilor spinali

### Mușchii Interspinali și Intertransversari

**Mușchii Interspinali (mm. interspinales)**
- Conectează procesele spinoase ale vertebrelor adiacente
- Extensia coloanei vertebrale

**Mușchii Intertransversari (mm. intertransversarii)**
- Conectează procesele transverse ale vertebrelor adiacente
- Înclinarea coloanei vertebrale în aceeași parte

## Semnificație Clinică

### Dureri de Spate
- Sindrom miofascial dureros
- Puncte trigger în mușchii spatelui
- Spasme musculare

### Postură
- Slăbiciunea mușchilor profunzi duce la tulburări de postură
- Hiperlordoză, cifoză, scolioză

### Medicină Sportivă
- Importanța întăririi mușchilor centrali
- Prevenirea traumatismelor coloanei vertebrale
- Reabilitare după traumatisme

## Întrebări pentru Autoevaluare

1. Care mușchi ai spatelui sunt superficiali?
2. Descrieți funcțiile celor trei părți ale mușchiului trapez
3. Ce mișcări efectuează mușchiul latissimus dorsi?
4. Din ce trei părți constă mușchiul erector spinae?
5. Ce mușchi asigură stabilizarea coloanei vertebrale?`

    await Topic.findOneAndUpdate(
      { name: { ru: 'Мышцы спины - полная анатомия' } },
      {
        content: {
          ru: backMuscleContent,
          ro: backMuscleContentRo,
        },
      }
    )

    console.log('✅ Тема "Мышцы спины" обновлена')

    // 2. Создать новую тему "Мышцы живота"
    console.log('\n2. Создание темы "Мышцы живота"...')

    const abdominalContent = `# Мышцы Живота

## Введение

Мышцы живота образуют переднюю и боковые стенки брюшной полости. Они выполняют важные функции: защищают внутренние органы, участвуют в дыхании, обеспечивают движения туловища и поддерживают внутрибрюшное давление.

## Передняя группа мышц живота

### Прямая мышца живота (m. rectus abdominis)

**Расположение:** Занимает всю переднюю стенку живота по обе стороны от срединной линии.

**Начало:** Хрящи V-VII ребер, мечевидный отросток грудины

**Прикрепление:** Лобковый гребень, лобковый симфиз

**Особенности строения:**
- Заключена в влагалище прямой мышцы живота
- Имеет 3-4 поперечные сухожильные перемычки
- Делится по средней линии белой линией живота (linea alba)

**Функция:**
- Сгибание туловища (наклон вперед)
- Опускание ребер (при выдохе)
- Повышение внутрибрюшного давления
- Участие в родах, дефекации, кашле, рвоте

**Иннервация:** Межреберные нервы (T5-T12)

**Кровоснабжение:** Верхняя и нижняя надчревные артерии

### Пирамидальная мышца (m. pyramidalis)

**Расположение:** Небольшая треугольная мышца в нижней части передней брюшной стенки.

**Начало:** Лобковый гребень

**Прикрепление:** Белая линия живота

**Функция:** Натягивает белую линию живота

**Иннервация:** Подчревный нерв (T12)

**Примечание:** Отсутствует у 10-20% людей

## Боковые мышцы живота

### Наружная косая мышца живота (m. obliquus externus abdominis)

**Расположение:** Самая поверхностная из боковых мышц живота.

**Начало:** Наружная поверхность V-XII ребер

**Прикрепление:**
- Передняя половина подвздошного гребня
- Паховая связка
- Апоневроз переходит в белую линию живота

**Направление волокон:** Сверху вниз и медиально (как руки в карманах)

**Функция:**
- При двустороннем сокращении: сгибание туловища
- При одностороннем сокращении: наклон туловища в ту же сторону и поворот в противоположную
- Опускание ребер
- Повышение внутрибрюшного давления

**Иннервация:** Межреберные нервы (T5-T12), подвздошно-подчревный и подвздошно-паховый нервы

### Внутренняя косая мышца живота (m. obliquus internus abdominis)

**Расположение:** Располагается под наружной косой мышцей.

**Начало:**
- Промежуточная линия подвздошного гребня
- Латеральная половина паховой связки
- Пояснично-грудная фасция

**Прикрепление:**
- Хрящи нижних ребер (X-XII)
- Апоневроз переходит в белую линию живота

**Направление волокон:** Снизу вверх и медиально (перпендикулярно наружной косой)

**Функция:**
- При двустороннем сокращении: сгибание туловища
- При одностороннем сокращении: наклон и поворот туловища в ту же сторону
- Опускание ребер
- Повышение внутрибрюшного давления

**Иннервация:** Межреберные нервы (T7-T12), подвздошно-подчревный и подвздошно-паховый нервы

### Поперечная мышца живота (m. transversus abdominis)

**Расположение:** Самая глубокая из боковых мышц живота.

**Начало:**
- Внутренняя поверхность хрящей VI-XII ребер
- Пояснично-грудная фасция
- Передняя половина подвздошного гребня
- Латеральная треть паховой связки

**Прикрепление:** Апоневроз переходит в белую линию живота

**Направление волокон:** Горизонтальное (поперечное)

**Функция:**
- Основная мышца-стабилизатор туловища
- Повышение внутрибрюшного давления
- Втягивание живота
- Поддержка внутренних органов
- Участие в дыхании (выдох)

**Иннервация:** Межреберные нервы (T7-T12), подвздошно-подчревный и подвздошно-паховый нервы

## Задняя группа мышц живота

### Квадратная мышца поясницы (m. quadratus lumborum)

**Расположение:** Задняя стенка брюшной полости.

**Начало:** Подвздошный гребень, подвздошно-поясничная связка

**Прикрепление:**
- XII ребро
- Поперечные отростки поясничных позвонков (L1-L4)

**Функция:**
- Наклон туловища в свою сторону
- При двустороннем сокращении: удерживает позвоночник в вертикальном положении
- Опускание XII ребра (вспомогательная дыхательная мышца)

**Иннервация:** Поясничное сплетение (T12-L4)

## Анатомические образования

### Белая линия живота (linea alba)

- Сухожильная полоса по срединной линии живота
- Образована переплетением апоневрозов всех боковых мышц живота
- Простирается от мечевидного отростка до лобкового симфиза
- В области пупка может расширяться

### Влагалище прямой мышцы живота

- Образовано апоневрозами боковых мышц живота
- Имеет переднюю и заднюю стенки
- Ниже дугообразной линии (linea arcuata) задняя стенка отсутствует

### Паховый канал

- Щель в нижней части передней брюшной стенки
- Длина около 4-5 см
- У мужчин проходит семенной канатик
- У женщин проходит круглая связка матки

## Функциональная анатомия

### Мышцы кора (core muscles)

Мышцы живота являются ключевой частью мышц кора:
- Стабилизация позвоночника и таза
- Передача силы между верхней и нижней частью тела
- Поддержание правильной осанки
- Защита позвоночника при нагрузках

### Дыхательная функция

- Мышцы живота - основные мышцы выдоха
- Сокращаясь, опускают ребра и повышают внутрибрюшное давление
- Диафрагма при этом поднимается, уменьшая объем грудной клетки

### Повышение внутрибрюшного давления

Важно при:
- Натуживании (дефекация, мочеиспускание, роды)
- Кашле и чихании
- Рвоте
- Подъеме тяжестей

## Клиническое значение

### Диастаз прямых мышц живота

- Расхождение прямых мышц по белой линии
- Часто возникает у женщин после беременности
- Может требовать хирургической коррекции

### Грыжи передней брюшной стенки

- **Пупочная грыжа:** выпячивание через пупочное кольцо
- **Паховая грыжа:** выпячивание через паховый канал
- **Послеоперационная грыжа:** в области рубца после операции

### Травмы мышц живота

- Растяжения и разрывы
- Ушибы
- Гематомы в толще мышц

### Слабость мышц живота

Последствия:
- Нарушения осанки (гиперлордоз поясницы)
- Боли в пояснице
- Дисфункция тазового дна
- Снижение спортивной работоспособности

## Вопросы для самопроверки

1. Какие мышцы образуют переднюю стенку живота?
2. Опишите направление волокон трех боковых мышц живота
3. Какая мышца является основным стабилизатором туловища?
4. Что такое белая линия живота и как она образована?
5. Какие функции выполняют мышцы живота?
6. Что проходит через паховый канал у мужчин и женщин?
7. Что такое диастаз прямых мышц живота?`

    const abdominalContentRo = `# Mușchii Abdominali

## Introducere

Mușchii abdominali formează pereții anterioară și laterali ai cavității abdominale. Aceștia îndeplinesc funcții importante: protejează organele interne, participă la respirație, asigură mișcările trunchiului și mențin presiunea intraabdominală.

## Grupa Anterioară a Mușchilor Abdominali

### Mușchiul Drept Abdominal (m. rectus abdominis)

**Localizare:** Ocupă întreaga perete anterioară a abdomenului de ambele părți ale liniei mediane.

**Origine:** Cartilajele coastelor V-VII, procesul xifoid al sternului

**Inserție:** Creasta pubiană, simfiza pubiană

**Caracteristici structurale:**
- Încadrat în teaca mușchiului drept abdominal
- Are 3-4 intersecții tendinoase transversale
- Împărțit pe linia mediană de linia albă (linea alba)

**Funcție:**
- Flexia trunchiului (înclinare înainte)
- Coborârea coastelor (la expir)
- Creșterea presiunii intraabdominale
- Participare la naștere, defecație, tuse, vărsături

**Inervație:** Nervi intercostali (T5-T12)

**Vascularizație:** Arterele epigastrice superioare și inferioare

### Mușchiul Piramidal (m. pyramidalis)

**Localizare:** Mușchi mic triunghiular în partea inferioară a peretelui abdominal anterior.

**Origine:** Creasta pubiană

**Inserție:** Linia albă

**Funcție:** Întinde linia albă

**Inervație:** Nervul hipogastric (T12)

**Notă:** Absent la 10-20% din oameni

## Mușchii Laterali ai Abdomenului

### Mușchiul Oblic Extern (m. obliquus externus abdominis)

**Localizare:** Cel mai superficial dintre mușchii laterali ai abdomenului.

**Origine:** Suprafața externă a coastelor V-XII

**Inserție:**
- Jumătatea anterioară a crestei iliace
- Ligamentul inghinal
- Aponeuroza trece în linia albă

**Direcția fibrelor:** De sus în jos și medial (ca mâinile în buzunare)

**Funcție:**
- La contracție bilaterală: flexia trunchiului
- La contracție unilaterală: înclinarea trunchiului în aceeași parte și rotația în partea opusă
- Coborârea coastelor
- Creșterea presiunii intraabdominale

**Inervație:** Nervi intercostali (T5-T12), nervi iliohipogastric și ilioinguinal

### Mușchiul Oblic Intern (m. obliquus internus abdominis)

**Localizare:** Se află sub mușchiul oblic extern.

**Origine:**
- Linia intermediară a crestei iliace
- Jumătatea laterală a ligamentului inghinal
- Fascia toracolombară

**Inserție:**
- Cartilajele coastelor inferioare (X-XII)
- Aponeuroza trece în linia albă

**Direcția fibrelor:** De jos în sus și medial (perpendicular pe oblicul extern)

**Funcție:**
- La contracție bilaterală: flexia trunchiului
- La contracție unilaterală: înclinarea și rotația trunchiului în aceeași parte
- Coborârea coastelor
- Creșterea presiunii intraabdominale

**Inervație:** Nervi intercostali (T7-T12), nervi iliohipogastric și ilioinguinal

### Mușchiul Transvers Abdominal (m. transversus abdominis)

**Localizare:** Cel mai profund dintre mușchii laterali ai abdomenului.

**Origine:**
- Suprafața internă a cartilajelor coastelor VI-XII
- Fascia toracolombară
- Jumătatea anterioară a crestei iliace
- Treimea laterală a ligamentului inghinal

**Inserție:** Aponeuroza trece în linia albă

**Direcția fibrelor:** Orizontală (transversală)

**Funcție:**
- Mușchiul principal stabilizator al trunchiului
- Creșterea presiunii intraabdominale
- Retracția abdomenului
- Susținerea organelor interne
- Participare la respirație (expir)

**Inervație:** Nervi intercostali (T7-T12), nervi iliohipogastric și ilioinguinal

## Grupa Posterioară a Mușchilor Abdominali

### Mușchiul Pătrat Lombar (m. quadratus lumborum)

**Localizare:** Peretele posterior al cavității abdominale.

**Origine:** Creasta iliacă, ligamentul iliolombar

**Inserție:**
- Coasta XII
- Procesele transverse ale vertebrelor lombare (L1-L4)

**Funcție:**
- Înclinarea trunchiului în aceeași parte
- La contracție bilaterală: menține coloana vertebrală în poziție verticală
- Coboară coasta XII (mușchi respirator auxiliar)

**Inervație:** Plexul lombar (T12-L4)

## Formațiuni Anatomice

### Linia Albă (linea alba)

- Bandă tendinoasă pe linia mediană a abdomenului
- Formată din întrepătrunderea aponeuroazelor tuturor mușchilor laterali
- Se întinde de la procesul xifoid până la simfiza pubiană
- În zona ombilicului se poate lărgi

### Teaca Mușchiului Drept Abdominal

- Formată din aponeuroazele mușchilor laterali ai abdomenului
- Are perete anterior și posterior
- Sub linia semilunară (linea arcuata) peretele posterior lipsește

### Canalul Inghinal

- Fante în partea inferioară a peretelui abdominal anterior
- Lungime circa 4-5 cm
- La bărbați trece cordonul spermatic
- La femei trece ligamentul rotund al uterului

## Anatomie Funcțională

### Mușchii Centrali (core muscles)

Mușchii abdominali sunt parte cheie a mușchilor centrali:
- Stabilizarea coloanei vertebrale și pelvisului
- Transmiterea forței între partea superioară și inferioară a corpului
- Menținerea posturii corecte
- Protecția coloanei la efort

### Funcția Respiratorie

- Mușchii abdominali - mușchi principali ai expirului
- Contractându-se, coboară coastele și cresc presiunea intraabdominală
- Diafragma se ridică, micșorând volumul toracic

### Creșterea Presiunii Intraabdominale

Important la:
- Forța (defecație, urinare, naștere)
- Tuse și strănut
- Vărsături
- Ridicarea greutăților

## Semnificație Clinică

### Diastazis Recti

- Separarea mușchilor drepți de-a lungul liniei albe
- Apare frecvent la femei după sarcină
- Poate necesita corecție chirurgicală

### Hernii ale Peretelui Abdominal Anterior

- **Hernie ombilicală:** proeminență prin inelul ombilical
- **Hernie inghinală:** proeminență prin canalul inghinal
- **Hernie postoperatorie:** în zona cicatricii după operație

### Traumatisme ale Mușchilor Abdominali

- Întinderi și rupturi
- Contuzii
- Hematoame în grosimea mușchilor

### Slăbiciune a Mușchilor Abdominali

Consecințe:
- Tulburări de postură (hiperlordoză lombară)
- Dureri lombare
- Disfuncție a planșeului pelvin
- Scăderea performanței sportive

## Întrebări pentru Autoevaluare

1. Ce mușchi formează peretele anterior al abdomenului?
2. Descrieți direcția fibrelor celor trei mușchi laterali abdominali
3. Care mușchi este principalul stabilizator al trunchiului?
4. Ce este linia albă și cum este formată?
5. Ce funcții îndeplinesc mușchii abdominali?
6. Ce trece prin canalul inghinal la bărbați și femei?
7. Ce este diastazis recti?`

    const maxOrder = await Topic.findOne({ categoryId: myologyId })
      .sort({ order: -1 })
      .select('order')

    await Topic.create({
      name: {
        ru: 'Мышцы живота',
        ro: 'Mușchii Abdominali',
      },
      description: {
        ru: 'Подробное изучение мышц живота: прямая, наружная косая, внутренняя косая, поперечная мышцы живота',
        ro: 'Studiu detaliat al mușchilor abdominali: mușchi drept, oblic extern, oblic intern, transvers abdominal',
      },
      content: {
        ru: abdominalContent,
        ro: abdominalContentRo,
      },
      categoryId: myologyId,
      slug: 'myshcy-zhivota',
      order: (maxOrder?.order || 0) + 1,
    })

    console.log('✅ Тема "Мышцы живота" создана')

    // 3. Обновить тему "Мышцы груди и живота" -> "Мышцы передней брюшной стенки"
    console.log('\n3. Обновление темы "Мышцы передней брюшной стенки"...')

    const anteriorWallContent = `# Мышцы Передней Брюшной Стенки

## Введение

Передняя брюшная стенка образована несколькими слоями мышц, которые защищают внутренние органы и выполняют важные функции в движении туловища, дыхании и поддержании внутрибрюшного давления.

## Анатомия передней брюшной стенки

### Слои передней брюшной стенки

**Снаружи внутрь:**
1. Кожа
2. Подкожная жировая клетчатка
3. Поверхностная фасция
4. Мышечный слой (несколько мышц)
5. Внутрибрюшная фасция
6. Париетальная брюшина

### Топографические линии

**Горизонтальные:**
- Реберная дуга (соединяет нижние края реберных дуг)
- Пупочная линия (на уровне пупка)
- Межостная линия (соединяет передние верхние ости подвздошных костей)

**Вертикальные:**
- Срединная линия (linea mediana)
- Окологрудинные линии (lineae parasternales)
- Среднеключичные линии (lineae medioclaviculares)

## Мышцы передней брюшной стенки

### Прямая мышца живота (m. rectus abdominis)

**Расположение:** Парная мышца, располагается по обе стороны от срединной линии.

**Начало:**
- Хрящи V, VI, VII ребер
- Мечевидный отросток грудины

**Прикрепление:**
- Лобковый гребень
- Верхний край лобкового симфиза

**Особенности:**
- Заключена во влагалище прямой мышцы живота
- Имеет 3-4 поперечные сухожильные перемычки (inscriptiones tendineae)
- Создает характерный рельеф ("кубики пресса")

**Функция:**
- Сгибание туловища (приближение грудной клетки к тазу)
- Опускание ребер при выдохе
- Повышение внутрибрюшного давления
- Стабилизация таза

**Иннервация:** Межреберные нервы (Th5-Th12)

**Кровоснабжение:**
- Верхняя надчревная артерия (a. epigastrica superior)
- Нижняя надчревная артерия (a. epigastrica inferior)

### Пирамидальная мышца (m. pyramidalis)

**Расположение:** Небольшая треугольная мышца в нижней части передней брюшной стенки.

**Начало:** Лобковый гребень и лобковый симфиз

**Прикрепление:** Белая линия живота (на 3-4 см выше места начала)

**Форма:** Треугольная, вершиной вверх

**Функция:**
- Натягивает белую линию живота
- Повышает внутрибрюшное давление

**Иннервация:** Подчревный нерв (n. subcostalis, Th12)

**Вариации:** Может отсутствовать (у 10-20% людей) или быть асимметричной

## Влагалище прямой мышцы живота

### Строение влагалища

**Передняя стенка:**
- Выше дугообразной линии: апоневроз наружной косой мышцы + передний листок апоневроза внутренней косой
- Ниже дугообразной линии: апоневрозы всех трех боковых мышц

**Задняя стенка:**
- Выше дугообразной линии: задний листок апоневроза внутренней косой + апоневроз поперечной мышцы
- Ниже дугообразной линии: отсутствует (только поперечная фасция)

### Дугообразная линия (linea arcuata)

- Располагается на границе между нижней и средней третью расстояния от пупка до лобкового симфиза
- Место, где заканчивается задняя стенка влагалища прямой мышцы
- Клинически важна как слабое место передней брюшной стенки

## Белая линия живота (linea alba)

### Анатомия

**Расположение:** По срединной линии от мечевидного отростка до лобкового симфиза

**Строение:**
- Образована переплетением апоневрозов боковых мышц живота обеих сторон
- Состоит из плотной соединительной ткани
- Не содержит мышечных волокон

**Ширина:**
- В верхней части (на уровне мечевидного отростка): 1-2 см
- На уровне пупка: может расширяться до 2-3 см
- В нижней части: 0,5-1 см

### Клиническое значение

**Пупочное кольцо (anulus umbilicalis):**
- Отверстие в белой линии на уровне пупка
- Слабое место, через которое может выходить пупочная грыжа

**Диастаз прямых мышц живота:**
- Расхождение прямых мышц по белой линии
- Часто возникает у женщин после беременности
- Белая линия может расширяться до 10 см и более

## Паховый канал (canalis inguinalis)

### Анатомия

**Расположение:** В нижней части передней брюшной стенки, над медиальной половиной паховой связки

**Длина:** 4-5 см

**Направление:** Косое, сверху вниз, снаружи внутрь, сзади наперед

### Стенки пахового канала

**Передняя стенка:**
- Апоневроз наружной косой мышцы живота (на всем протяжении)
- Латерально: мышечные волокна внутренней косой мышцы

**Задняя стенка:**
- Поперечная фасция (на всем протяжении)
- Медиально: усилена соединительной паховой связкой

**Верхняя стенка (крыша):**
- Нижние края внутренней косой и поперечной мышц живота

**Нижняя стенка (дно):**
- Паховая связка (lig. inguinale)

### Отверстия пахового канала

**Глубокое паховое кольцо (anulus inguinalis profundus):**
- Внутреннее отверстие канала
- Образовано поперечной фасцией
- Располагается на 1-2 см выше середины паховой связки

**Поверхностное паховое кольцо (anulus inguinalis superficialis):**
- Наружное отверстие канала
- Образовано расщеплением апоневроза наружной косой мышцы
- Располагается над лобковым бугорком

### Содержимое пахового канала

**У мужчин:**
- Семенной канатик (funiculus spermaticus)
- Подвздошно-паховый нерв

**У женщин:**
- Круглая связка матки (lig. teres uteri)
- Подвздошно-паховый нерв

## Функциональная анатомия

### Биомеханика передней брюшной стенки

**Стабилизация туловища:**
- Прямая мышца живота обеспечивает сгибание туловища
- Совместно с мышцами спины создает "мышечный корсет"
- Важна для правильной осанки

**Дыхательная функция:**
- Мышцы передней брюшной стенки участвуют в форсированном выдохе
- Сокращаясь, они опускают ребра и повышают внутрибрюшное давление
- Диафрагма при этом поднимается

**Повышение внутрибрюшного давления:**
- Необходимо при натуживании (дефекация, роды)
- При кашле и чихании
- При подъеме тяжестей

### Взаимодействие с другими мышцами

**С диафрагмой:**
- Антагонисты в дыхании
- Синергисты при повышении внутрибрюшного давления

**С мышцами спины:**
- Создают баланс для стабилизации позвоночника
- Слабость мышц живота приводит к гиперлордозу поясницы

**С мышцами тазового дна:**
- Совместная работа при повышении внутрибрюшного давления
- Важно при беременности и родах

## Клиническое значение

### Грыжи передней брюшной стенки

**Паховая грыжа:**
- Самая частая грыжа передней брюшной стенки
- У мужчин встречается в 9 раз чаще, чем у женщин
- Выходит через паховый канал

**Пупочная грыжа:**
- Выходит через пупочное кольцо
- У взрослых чаще встречается у женщин

**Эпигастральная грыжа:**
- Выходит через дефект в белой линии живота выше пупка

**Грыжа Спигелиевой линии:**
- Редкая грыжа, выходит по латеральному краю прямой мышцы

### Диастаз прямых мышц живота

**Причины:**
- Беременность (самая частая причина)
- Ожирение
- Тяжелые физические нагрузки
- Врожденная слабость соединительной ткани

**Диагностика:**
- Визуально: выпячивание по средней линии при напряжении
- Пальпация: можно прощупать расхождение мышц
- УЗИ: точное измерение ширины расхождения

**Лечение:**
- Консервативное: специальные упражнения, бандаж
- Хирургическое: при расхождении более 5 см

### Разрывы мышц

**Причины:**
- Травмы (прямой удар, падение)
- Резкое чрезмерное сокращение
- Спортивные травмы

**Проявления:**
- Боль в области разрыва
- Гематома
- Нарушение функции

### Хирургические доступы

**Срединная лапаротомия:**
- Разрез по белой линии живота
- Хороший доступ к органам брюшной полости
- Меньше повреждение нервов и сосудов

**Параректальный доступ:**
- Разрез вдоль латерального края прямой мышцы
- Используется при операциях на почках

## Исследование передней брюшной стенки

### Осмотр

- Форма живота (нормальный, втянутый, выпяченный)
- Симметричность
- Видимая перистальтика
- Расширенные вены
- Грыжевые выпячивания

### Пальпация

- Напряжение мышц
- Болезненность
- Определение расхождения прямых мышц
- Грыжевые ворота

### Инструментальные методы

**УЗИ:**
- Оценка толщины мышц
- Диагностика диастаза
- Выявление грыж

**КТ/МРТ:**
- Детальная оценка всех слоев брюшной стенки
- Диагностика осложнений грыж
- Планирование операций

## Вопросы для самопроверки

1. Какие мышцы образуют переднюю брюшную стенку?
2. Опишите строение влагалища прямой мышцы живота выше и ниже дугообразной линии
3. Что такое белая линия живота и как она образуется?
4. Опишите стенки и содержимое пахового канала у мужчин и женщин
5. Какие грыжи могут возникать в области передней брюшной стенки?
6. Что такое диастаз прямых мышц живота и как его диагностировать?
7. Какую роль играют мышцы передней брюшной стенки в дыхании?`

    const anteriorWallContentRo = `# Mușchii Peretelui Abdominal Anterior

## Introducere

Peretele abdominal anterior este format din mai multe straturi de mușchi care protejează organele interne și îndeplinesc funcții importante în mișcarea trunchiului, respirație și menținerea presiunii intraabdominale.

## Anatomia Peretelui Abdominal Anterior

### Straturile Peretelui Abdominal Anterior

**Din afară în interior:**
1. Piele
2. Țesut adipos subcutanat
3. Fascia superficială
4. Stratul muscular (mai mulți mușchi)
5. Fascia intraabdominală
6. Peritoneul parietal

### Linii Topografice

**Orizontale:**
- Arcul costal (conectează marginile inferioare ale arcurilor costale)
- Linia ombilicală (la nivelul ombilicului)
- Linia interspinală (conectează spinele iliace antero-superioare)

**Verticale:**
- Linia mediană (linea mediana)
- Liniile parasternale (lineae parasternales)
- Liniile medioclaviculare (lineae medioclaviculares)

## Mușchii Peretelui Abdominal Anterior

### Mușchiul Drept Abdominal (m. rectus abdominis)

**Localizare:** Mușchi pereche, dispus de ambele părți ale liniei mediane.

**Origine:**
- Cartilajele coastelor V, VI, VII
- Procesul xifoid al sternului

**Inserție:**
- Creasta pubiană
- Marginea superioară a simfizei pubiene

**Caracteristici:**
- Încadrat în teaca mușchiului drept abdominal
- Are 3-4 intersecții tendinoase transversale (inscriptiones tendineae)
- Creează relief caracteristic ("cuburi abdominale")

**Funcție:**
- Flexia trunchiului (apropierea toracelui de pelvis)
- Coborârea coastelor la expir
- Creșterea presiunii intraabdominale
- Stabilizarea pelvisului

**Inervație:** Nervi intercostali (Th5-Th12)

**Vascularizație:**
- Artera epigastrică superioară (a. epigastrica superior)
- Artera epigastrică inferioară (a. epigastrica inferior)

### Mușchiul Piramidal (m. pyramidalis)

**Localizare:** Mușchi mic triunghiular în partea inferioară a peretelui abdominal anterior.

**Origine:** Creasta pubiană și simfiza pubiană

**Inserție:** Linia albă (la 3-4 cm deasupra punctului de origine)

**Formă:** Triunghiulară, cu vârful în sus

**Funcție:**
- Întinde linia albă
- Crește presiunea intraabdominală

**Inervație:** Nervul subcostal (n. subcostalis, Th12)

**Variații:** Poate lipsi (la 10-20% din oameni) sau poate fi asimetric

## Teaca Mușchiului Drept Abdominal

### Structura Tecii

**Peretele anterior:**
- Deasupra liniei semilunare: aponeuroza oblicului extern + foiță anterioară a aponeuroazei oblicului intern
- Sub linia semilunară: aponeuroazele tuturor celor trei mușchi laterali

**Peretele posterior:**
- Deasupra liniei semilunare: foiță posterioară a aponeuroazei oblicului intern + aponeuroza transversului
- Sub linia semilunară: absent (doar fascia transversală)

### Linia Semilunară (linea arcuata)

- Situată la granița dintre treimea inferioară și treimea mijlocie a distanței de la ombilic la simfiza pubiană
- Locul unde se termină peretele posterior al tecii mușchiului drept
- Important clinic ca punct slab al peretelui abdominal anterior

## Linia Albă (linea alba)

### Anatomie

**Localizare:** Pe linia mediană de la procesul xifoid până la simfiza pubiană

**Structură:**
- Formată din întrepătrunderea aponeuroazelor mușchilor laterali ai abdomenului de ambele părți
- Constă din țesut conjunctiv dens
- Nu conține fibre musculare

**Lățime:**
- În partea superioară (la nivelul procesului xifoid): 1-2 cm
- La nivelul ombilicului: se poate lărgi până la 2-3 cm
- În partea inferioară: 0,5-1 cm

### Semnificație Clinică

**Inelul ombilical (anulus umbilicalis):**
- Orificiu în linia albă la nivelul ombilicului
- Punct slab prin care poate ieși hernia ombilicală

**Diastazis recti:**
- Separarea mușchilor drepți de-a lungul liniei albe
- Apare frecvent la femei după sarcină
- Linia albă se poate lărgi până la 10 cm și mai mult

## Canalul Inghinal (canalis inguinalis)

### Anatomie

**Localizare:** În partea inferioară a peretelui abdominal anterior, deasupra jumătății mediale a ligamentului inghinal

**Lungime:** 4-5 cm

**Direcție:** Oblică, de sus în jos, din lateral în medial, de la spate înainte

### Pereții Canalului Inghinal

**Peretele anterior:**
- Aponeuroza oblicului extern (pe toată lungimea)
- Lateral: fibre musculare ale oblicului intern

**Peretele posterior:**
- Fascia transversală (pe toată lungimea)
- Medial: întărit de ligamentul inghinal conjunctiv

**Peretele superior (acoperiș):**
- Marginile inferioare ale oblicului intern și transversului

**Peretele inferior (podea):**
- Ligamentul inghinal (lig. inguinale)

### Orificiile Canalului Inghinal

**Inelul inghinal profund (anulus inguinalis profundus):**
- Orificiul intern al canalului
- Format de fascia transversală
- Situat la 1-2 cm deasupra mijlocului ligamentului inghinal

**Inelul inghinal superficial (anulus inguinalis superficialis):**
- Orificiul extern al canalului
- Format prin despicarea aponeuroazei oblicului extern
- Situat deasupra tubercului pubic

### Conținutul Canalului Inghinal

**La bărbați:**
- Cordonul spermatic (funiculus spermaticus)
- Nervul ilioinguinal

**La femei:**
- Ligamentul rotund al uterului (lig. teres uteri)
- Nervul ilioinguinal

## Anatomie Funcțională

### Biomecanica Peretelui Abdominal Anterior

**Stabilizarea trunchiului:**
- Mușchiul drept abdominal asigură flexia trunchiului
- Împreună cu mușchii spatelui creează "corsetul muscular"
- Important pentru postura corectă

**Funcția respiratorie:**
- Mușchii peretelui abdominal anterior participă la expirația forțată
- Contractându-se, coboară coastele și cresc presiunea intraabdominală
- Diafragma se ridică

**Creșterea presiunii intraabdominale:**
- Necesară la forță (defecație, naștere)
- La tuse și strănut
- La ridicarea greutăților

### Interacțiunea cu Alți Mușchi

**Cu diafragma:**
- Antagoniști în respirație
- Sinergiști la creșterea presiunii intraabdominale

**Cu mușchii spatelui:**
- Creează echilibru pentru stabilizarea coloanei vertebrale
- Slăbiciunea mușchilor abdominali duce la hiperlordoză lombară

**Cu mușchii planșeului pelvin:**
- Lucru comun la creșterea presiunii intraabdominale
- Important în timpul sarcinii și nașterii

## Semnificație Clinică

### Hernii ale Peretelui Abdominal Anterior

**Hernia inghinală:**
- Cea mai frecventă hernie a peretelui abdominal anterior
- La bărbați apare de 9 ori mai frecvent decât la femei
- Iese prin canalul inghinal

**Hernia ombilicală:**
- Iese prin inelul ombilical
- La adulți apare mai frecvent la femei

**Hernia epigastrică:**
- Iese printr-un defect în linia albă deasupra ombilicului

**Hernia liniei Spiegel:**
- Hernie rară, iese pe marginea laterală a mușchiului drept

### Diastazis Recti

**Cauze:**
- Sarcină (cea mai frecventă cauză)
- Obezitate
- Eforturi fizice intense
- Slăbiciune congenitală a țesutului conjunctiv

**Diagnostic:**
- Vizual: proeminență pe linia mediană la efort
- Palpație: se poate simți separarea mușchilor
- Ecografie: măsurare exactă a lățimii separării

**Tratament:**
- Conservativ: exerciții speciale, bandaj
- Chirurgical: la separare mai mare de 5 cm

### Rupturi Musculare

**Cauze:**
- Traumatisme (lovitură directă, cădere)
- Contracție bruscă excesivă
- Traumatisme sportive

**Manifestări:**
- Durere în zona rupturii
- Hematomm
- Afectarea funcției

### Accese Chirurgicale

**Laparotomia mediană:**
- Incizie pe linia albă
- Acces bun la organele cavității abdominale
- Mai puține leziuni ale nervilor și vaselor

**Acces pararectal:**
- Incizie de-a lungul marginii laterale a mușchiului drept
- Utilizat în operațiile pe rinichi

## Examinarea Peretelui Abdominal Anterior

### Inspecție

- Forma abdomenului (normal, retractat, prooeminent)
- Simetrie
- Peristaltică vizibilă
- Vene dilatate
- Proeminențe herniale

### Palpație

- Tensiune musculară
- Sensibilitate
- Determinarea separării mușchilor drepți
- Porțile herniale

### Metode Instrumentale

**Ecografie:**
- Evaluarea grosimii mușchilor
- Diagnosticul diastazisului
- Depistarea herniilor

**CT/RMN:**
- Evaluare detaliată a tuturor straturilor peretelui abdominal
- Diagnosticul complicațiilor herniilor
- Planificarea operațiilor

## Întrebări pentru Autoevaluare

1. Ce mușchi formează peretele abdominal anterior?
2. Descrieți structura tecii mușchiului drept abdominal deasupra și sub linia semilunară
3. Ce este linia albă și cum se formează?
4. Descrieți pereții și conținutul canalului inghinal la bărbați și femei
5. Ce hernii pot apărea în zona peretelui abdominal anterior?
6. Ce este diastazis recti și cum se diagnostichează?
7. Ce rol joacă mușchii peretelui abdominal anterior în respirație?`

    await Topic.findOneAndUpdate(
      { name: { ru: 'Мышцы груди и живота' } },
      {
        name: {
          ru: 'Мышцы передней брюшной стенки',
          ro: 'Mușchii Peretelui Abdominal Anterior',
        },
        description: {
          ru: 'Детальное изучение анатомии передней брюшной стенки: прямая мышца живота, влагалище прямой мышцы, белая линия живота, паховый канал',
          ro: 'Studiu detaliat al anatomiei peretelui abdominal anterior: mușchiul drept abdominal, teaca mușchiului drept, linia albă, canalul inghinal',
        },
        content: {
          ru: anteriorWallContent,
          ro: anteriorWallContentRo,
        },
      }
    )

    console.log('✅ Тема "Мышцы передней брюшной стенки" обновлена')

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Все мышечные темы успешно обновлены!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📋 Выполненные изменения:')
    console.log('1. ✅ Обновлена тема "Мышцы спины - полная анатомия" (убрана тестовая информация)')
    console.log('2. ✅ Создана новая тема "Мышцы живота"')
    console.log('3. ✅ Переименована тема "Мышцы груди и живота" → "Мышцы передней брюшной стенки"')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка обновления тем:', error)
    process.exit(1)
  }
}

updateMuscleTopics()
