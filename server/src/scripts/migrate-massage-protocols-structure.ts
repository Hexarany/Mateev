import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import MassageProtocol from '../models/MassageProtocol'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

/**
 * Скрипт миграции для правильного распределения контента между полями:
 * - content: общая информация о массаже
 * - technique: пошаговые инструкции выполнения
 */

const protocolUpdates = [
  // 1. Классический массаж всего тела
  {
    slug: 'klassicheskiy-massazh-vsego-tela',
    content: {
      ru: `# Классический массаж всего тела

Классический массаж — это комплексная терапевтическая процедура, направленная на общее оздоровление организма, улучшение кровообращения, расслабление мышц и снятие стресса. Включает все 47 основных приёмов классического массажа.

## Продолжительность
75 минут (полный сеанс всего тела)

## Подготовка
- Комфортная температура в помещении (22-24°C)
- Массажный стол с чистым бельем
- Качественное массажное масло
- Мягкое освещение и расслабляющая музыка

## Зоны воздействия
1. Спина и поясница
2. Шея и плечевой пояс
3. Руки (плечи, предплечья, кисти)
4. Ноги (бёдра, голени, стопы)
5. Грудь и живот (по показаниям)

## Основные техники
В классическом массаже используются 47 приёмов, объединённых в 5 основных групп:
- Поглаживание (9 видов)
- Растирание (10 видов)
- Разминание (15 видов)
- Вибрация (7 видов)
- Ударные приёмы (6 видов)`,
      ro: `# Masajul clasic al întregului corp

Masajul clasic este o procedură terapeutică complexă, destinată sănătății generale a organismului, îmbunătățirii circulației sanguine, relaxării musculare și eliminării stresului. Include toate cele 47 de tehnici principale ale masajului clasic.

## Durată
75 minute (sesiune completă pentru întreg corpul)

## Pregătire
- Temperatură confortabilă în încăpere (22-24°C)
- Masă de masaj cu lenjerie curată
- Ulei de masaj de calitate
- Iluminare soft și muzică relaxantă

## Zone de impact
1. Spate și zona lombară
2. Gât și centura scapulară
3. Brațe (umeri, antebrațe, mâini)
4. Picioare (coapse, gambe, tălpi)
5. Piept și abdomen (după indicații)

## Tehnici principale
În masajul clasic se folosesc 47 de tehnici, unite în 5 grupe principale:
- Mângâiere (9 tipuri)
- Frecare (10 tipuri)
- Frământare (15 tipuri)
- Vibrație (7 tipuri)
- Tehnici de percuție (6 tipuri)`,
    },
    technique: {
      ru: `## Протокол выполнения классического массажа (47 приёмов)

### Последовательность работы

#### 1. Спина (20 минут) - Приёмы 1-17
**1. Контакт**
- Установление первого контакта с телом клиента
- Мягкое прикосновение для адаптации

**2. Поглаживание ладонью**
- Разогревающие движения всей ладонью
- От поясницы к шее

**3. Поглаживание двумя ладонями**
- Синхронные движения обеими руками
- Вдоль позвоночника и по бокам спины

**4. Разминание четырьмя пальцами (две руки)**
- Глубокая проработка длинных мышц спины
- Параллельно позвоночнику с обеих сторон

**5. Разминание четырьмя пальцами (одна рука)**
- Точечная проработка напряжённых участков
- Область лопаток и поясницы

**6. Капля**
- Волнообразное движение от основания ладони к пальцам
- По всей поверхности спины

**7. Вертикальное разминание**
- Движения вдоль мышечных волокон
- От поясницы к шее

**8. Две капли**
- Синхронные "капли" обеими руками
- Ритмичные волнообразные движения

**9. Горизонтальное разминание**
- Поперёк мышечных волокон
- От позвоночника к бокам

**10. Кулаки (от себя)**
- Разминание костяшками пальцев
- Движения от позвоночника к периферии

**11. Кулаки (к себе)**
- Обратные движения костяшками
- От боков к позвоночнику

**12. Локти (снизу вверх)**
- Глубокое воздействие локтями
- От крестца к плечам

**13. Локоть (только вниз)**
- Скольжение локтем сверху вниз
- Вдоль позвоночника (паравертебрально)

**14. Локоть (только вверх с вращением)**
- Спиралевидные движения локтем снизу вверх
- Проработка глубоких мышц

**15. Локти (от шеи к тазу)**
- Длинные движения обоими локтями
- Синхронно вдоль спины

**16. Елочка (большая)**
- Диагональные движения от позвоночника
- Под углом 45° к бокам

**17. Елочка (маленькая)**
- Мелкие диагональные движения
- Детальная проработка околопозвоночной зоны

#### 2. Руки (10 минут на обе) - Приёмы 18-22
**18. Разминание на шее (вертикальное тремя пальцами)**
- Проработка боковых мышц шеи
- Тремя пальцами вдоль шейных мышц

**19. Разминание ладони и пальцев**
- Проработка каждого пальца отдельно
- Разминание ладонной поверхности и межпальцевых промежутков

**20. Елочка на предплечье (3 линии)**
- Диагональные движения по трём линиям
- От запястья к локтю

**21. Вертикальное и горизонтальное разминание (бицепс и трицепс)**
- Продольное разминание по ходу мышц
- Поперечное разминание поперёк волокон

**22. Сжатие на ладони, предплечье и плече (под тремя углами - 45°, 90°, 135°)**
- Компрессионные движения под разными углами
- Улучшение венозного оттока

#### 3. Ноги - задняя поверхность (15 минут на обе) - Приёмы 23-29
**23. Разминание стопы и пальцев**
- Проработка каждого пальца ноги
- Разминание подошвенной поверхности

**24. Брусничка**
- Мелкие круговые движения подушечками пальцев
- По всей поверхности стопы

**25. Голень (елочка по 3 линиям)**
- Диагональные движения по икроножной мышце
- Три параллельные линии от пятки к колену

**26. Вертикальное и горизонтальное разминание (2:1:2)**
- Соотношение продольных и поперечных движений
- Икроножная мышца

**27. Повторение на бедре**
- Аналогичные приёмы на задней поверхности бедра
- Глубокая проработка

**28. Работа на ягодичной зоне (капля, кулаки)**
- "Капля" на ягодичных мышцах
- Разминание кулаками

**29. Сжатие на стопе, голени (локтем), бедре (локтем)**
- Компрессия стопы руками
- Глубокое сжатие голени и бедра локтями

#### 4. Ноги - передняя поверхность (15 минут на обе) - Приёмы 30-42
**30. Работа между пальцами (передняя часть стопы)**
- Проработка межпальцевых промежутков
- Разминание тыльной поверхности стопы

**31. Брусничка**
- Мелкие круговые движения на тыльной стороне стопы

**32. Голень (под малоберцовой, на большеберцовой, под малоберцовой делаем елочку)**
- Проработка трёх зон голени
- "Елочка" в боковых зонах

**33. Колено (разминание вертикальными линиями)**
- Круговые движения вокруг коленной чашечки
- Вертикальные линии по бокам колена

**34. Бедро (елочка по 3 линиям)**
- Три линии на передней поверхности бедра
- От колена к тазу

**35. Разминание горизонтальное и вертикальное**
- Чередование направлений
- Квадрицепс

**36. Разминание четырьмя пальцами по линиям**
- Детальная проработка мышц бедра
- По ходу мышечных волокон

**37. Кулаки (внешняя и внутренняя сторона бедра)**
- Разминание боковых поверхностей бедра
- Костяшками кулаков

**38. Локоть (на внешней стороне бедра)**
- Глубокое воздействие на илиотибиальный тракт
- От колена к тазу

**39. Локоть (на внутренней стороне бедра)**
- Проработка приводящих мышц
- Осторожно, избегая сосудов

**40. Сжатие (90°)**
- Компрессия бедра под прямым углом
- Улучшение венозного оттока

**41. Сжатие (135°)**
- Компрессия под тупым углом
- Завершающий дренаж

**42. Сжатие (45°)**
- Компрессия под острым углом
- Финальное сжатие

#### 5. Грудь (5 минут) - Приёмы 43-44
**43. Елочка на всей грудной зоне (работаем от грудины к плечу) - МУЖЧИНА**
- Диагональные движения от центра грудины
- К плечевым суставам
- Проработка грудных мышц

**44. Елочка в зоне T (на грудине и под ключицей) - ЖЕНЩИНА**
- Т-образная зона: грудина и подключичная область
- Деликатная работа, избегая молочных желез

#### 6. Завершение - шея и голова (5 минут) - Приёмы 45-47
**45. Шея (5 точек, удержание 8-10 сек)**
- Акупрессура на 5 точках шеи
- Каждую точку удерживаем 8-10 секунд
- Снятие напряжения

**46. Сжатие четырьмя пальцами**
- Параллельно позвоночнику
- От трапециевидной зоны к голове
- 10 раз по одному пальцу, затем 5 раз вместе

**47. Фиксируем голову пальцами на затылочной линии, удержание 90 сек**
- Финальная релаксация
- Пальцы на затылочной линии роста волос
- Глубокое расслабление 90 секунд`,
      ro: `## Protocol de execuție a masajului clasic (47 tehnici)

### Secvența de lucru

#### 1. Spate (20 minute) - Tehnici 1-17
**1. Contact**
- Stabilirea primului contact cu corpul clientului
- Atingere delicată pentru adaptare

**2. Mângâiere cu palma**
- Mișcări de încălzire cu toată palma
- De la zona lombară la gât

**3. Mângâiere cu două palme**
- Mișcări sincrone cu ambele mâini
- De-a lungul coloanei și pe lateralele spatelui

**4. Frământare cu patru degete (două mâini)**
- Lucrare profundă a mușchilor lungi ai spatelui
- Paralel cu coloana de ambele părți

**5. Frământare cu patru degete (o mână)**
- Lucrare punctuală a zonelor tensionate
- Zona omoplațiilor și lombară

**6. Picătura**
- Mișcare ondulată de la baza palmei la degete
- Pe toată suprafața spatelui

**7. Frământare verticală**
- Mișcări de-a lungul fibrelor musculare
- De la zona lombară la gât

**8. Două picături**
- "Picături" sincrone cu ambele mâini
- Mișcări ondulate ritmice

**9. Frământare orizontală**
- Perpendicular pe fibrele musculare
- De la coloană spre laterale

**10. Pumni (de la sine)**
- Frământare cu nodurile degetelor
- Mișcări de la coloană spre periferie

**11. Pumni (spre sine)**
- Mișcări inverse cu nodurile degetelor
- De la laterale spre coloană

**12. Coate (de jos în sus)**
- Impact profund cu coatele
- De la sacru la umeri

**13. Cot (doar în jos)**
- Alunecare cu cotul de sus în jos
- De-a lungul coloanei (paravertebral)

**14. Cot (doar în sus cu rotație)**
- Mișcări spiralate cu cotul de jos în sus
- Lucrare pe mușchii profunzi

**15. Coate (de la gât la bazin)**
- Mișcări lungi cu ambele coate
- Sincron de-a lungul spatelui

**16. Brăduț (mare)**
- Mișcări diagonale de la coloană
- Sub unghi de 45° spre laterale

**17. Brăduț (mic)**
- Mișcări diagonale fine
- Lucrare detaliată a zonei paravertebrale

#### 2. Brațe (10 minute pentru ambele) - Tehnici 18-22
**18. Frământare pe gât (verticală cu trei degete)**
- Lucrare pe mușchii laterali ai gâtului
- Cu trei degete de-a lungul mușchilor cervicali

**19. Frământare palmă și degete**
- Lucrare pe fiecare deget separat
- Frământare a suprafeței palmare și spațiilor interdigitale

**20. Brăduț pe antebraț (3 linii)**
- Mișcări diagonale pe trei linii
- De la încheietura mâinii la cot

**21. Frământare verticală și orizontală (biceps și triceps)**
- Frământare longitudinală de-a lungul mușchilor
- Frământare transversală perpendicular pe fibre

**22. Compresie pe palmă, antebraț și umăr (sub trei unghiuri - 45°, 90°, 135°)**
- Mișcări de compresie sub diferite unghiuri
- Îmbunătățirea drenajului venos

#### 3. Picioare - suprafața posterioară (15 minute pentru ambele) - Tehnici 23-29
**23. Frământare picior și degete**
- Lucrare pe fiecare deget al piciorului
- Frământare a suprafeței plantare

**24. Merișor**
- Mișcări circulare fine cu vârfurile degetelor
- Pe toată suprafața piciorului

**25. Gambă (brăduț pe 3 linii)**
- Mișcări diagonale pe mușchiul gambar
- Trei linii paralele de la călcâi la genunchi

**26. Frământare verticală și orizontală (2:1:2)**
- Raport între mișcări longitudinale și transversale
- Mușchiul gambar

**27. Repetare pe coapsă**
- Tehnici similare pe suprafața posterioară a coapsei
- Lucrare profundă

**28. Lucru pe zona fesierei (picătura, pumni)**
- "Picătura" pe mușchii fesieri
- Frământare cu pumnii

**29. Compresie pe picior, gambă (cu cotul), coapsă (cu cotul)**
- Compresie a piciorului cu mâinile
- Compresie profundă a gambei și coapsei cu coatele

#### 4. Picioare - suprafața anterioară (15 minute pentru ambele) - Tehnici 30-42
**30. Lucru între degete (partea anterioară a piciorului)**
- Lucrare pe spațiile interdigitale
- Frământare a suprafeței dorsale a piciorului

**31. Merișor**
- Mișcări circulare fine pe partea dorsală a piciorului

**32. Gambă (sub peroneul, pe tibie, sub peroneu facem brăduț)**
- Lucrare pe cele trei zone ale gambei
- "Brăduț" în zonele laterale

**33. Genunchi (frământare cu linii verticale)**
- Mișcări circulare în jurul rotulei
- Linii verticale pe lateralele genunchiului

**34. Coapsă (brăduț pe 3 linii)**
- Trei linii pe suprafața anterioară a coapsei
- De la genunchi la bazin

**35. Frământare orizontală și verticală**
- Alternarea direcțiilor
- Cvadriceps

**36. Frământare cu patru degete pe linii**
- Lucrare detaliată a mușchilor coapsei
- De-a lungul fibrelor musculare

**37. Pumni (partea exterioară și interioară a coapsei)**
- Frământare a suprafețelor laterale ale coapsei
- Cu nodurile pumnilor

**38. Cot (pe partea exterioară a coapsei)**
- Impact profund pe tractul iliotibial
- De la genunchi la bazin

**39. Cot (pe partea interioară a coapsei)**
- Lucrare pe mușchii aductori
- Cu precauție, evitând vasele

**40. Compresie (90°)**
- Compresie a coapsei sub unghi drept
- Îmbunătățirea drenajului venos

**41. Compresie (135°)**
- Compresie sub unghi obtuz
- Drenaj final

**42. Compresie (45°)**
- Compresie sub unghi ascuțit
- Compresie finală

#### 5. Piept (5 minute) - Tehnici 43-44
**43. Brăduț pe toată zona toracică (lucrăm de la stern la umăr) - BĂRBAT**
- Mișcări diagonale de la centrul sternului
- Spre articulațiile umerilor
- Lucrare pe mușchii pectorali

**44. Brăduț în zona T (pe stern și sub claviculă) - FEMEIE**
- Zona în formă de T: stern și zona subclaviculară
- Lucrare delicată, evitând glandele mamare

#### 6. Finalizare - gât și cap (5 minute) - Tehnici 45-47
**45. Gât (5 puncte, menținere 8-10 sec)**
- Acupresură pe 5 puncte ale gâtului
- Fiecare punct menținut 8-10 secunde
- Eliminarea tensiunii

**46. Compresie cu patru degete**
- Paralel cu coloana
- De la zona trapezului spre cap
- De 10 ori câte un deget, apoi de 5 ori împreună

**47. Fixăm capul cu degetele pe linia occipitală, menținere 90 sec**
- Relaxare finală
- Degete pe linia occipitală de creștere a părului
- Relaxare profundă 90 secunde`,
    },
  },

  // 2. Антицеллюлитный массаж
  {
    slug: 'antitsellyulitnyy-massazh',
    content: {
      ru: `# Антицеллюлитный массаж

Антицеллюлитный массаж — это специализированная техника, направленная на борьбу с целлюлитом, улучшение микроциркуляции, лимфодренаж и повышение тонуса кожи. Эффективен в комплексной программе коррекции фигуры.

## Продолжительность
50 минут

## Подготовка
- Тёплый душ перед процедурой
- Пилинг проблемных зон (за день до процедуры)
- Антицеллюлитное масло или крем
- Температура в помещении 23-25°C

## Проблемные зоны
1. Бёдра (задняя и боковая поверхность)
2. Ягодицы
3. Живот
4. Внутренняя поверхность рук (по показаниям)

## Стадии целлюлита
- **1 стадия:** видим только при сжатии кожи
- **2 стадия:** заметен в положении стоя
- **3 стадия:** виден в любом положении
- **4 стадия:** выраженные узлы и бугры`,
      ro: `# Masaj anticelulitic

Masajul anticelulitic este o tehnică specializată, destinată combaterii celulitei, îmbunătățirii microcirculației, drenajului limfatic și creșterii tonusului pielii. Eficient în programul complex de corecție a figurii.

## Durată
50 minute

## Pregătire
- Duș călduț înainte de procedură
- Peeling al zonelor problematice (cu o zi înainte)
- Ulei sau cremă anticelulitică
- Temperatură în încăpere 23-25°C

## Zone problematice
1. Coapse (suprafața posterioară și laterală)
2. Fese
3. Abdomen
4. Suprafața interioară a brațelor (după indicații)

## Stadiile celulitei
- **Stadiul 1:** vizibil doar la comprimarea pielii
- **Stadiul 2:** observabil în poziție verticală
- **Stadiul 3:** vizibil în orice poziție
- **Stadiul 4:** noduli și protuberanțe pronunțate`,
    },
    technique: {
      ru: `## Протокол антицеллюлитного массажа

### Последовательность выполнения

#### 1. Подготовительный этап (5 минут)
- Разогревающее поглаживание всей зоны
- Лёгкое растирание ладонями
- Активизация кровообращения

#### 2. Бёдра - задняя поверхность (15 минут)
**Глубокое разминание:**
- Захват и отжим мышц снизу вверх
- Валяние с усилием
- Выжимание подушечками пальцев
- Щипковые движения (пощипывание)

**Растирание:**
- Пиление рёбрами ладоней (интенсивное)
- Круговое с нажимом костяшками пальцев
- Спиралевидное двумя руками встречными движениями

**Ударные приёмы:**
- Рубление рёбрами ладоней (2-3 минуты)
- Похлопывание ладонями (усиленное)
- Поколачивание кулаками

#### 3. Бёдра - боковая поверхность ("галифе") (10 минут)
- Глубокое разминание с захватом
- Интенсивное растирание костяшками
- Щипковый массаж
- Накатывание на кулак
- Рубление вдоль линии бедра

#### 4. Ягодицы (10 минут)
**Разминание:**
- Круговое двумя руками
- Сдвигание и растяжение
- Накатывание на кулак

**Ударные техники:**
- Интенсивное похлопывание
- Рубление крест-накрест
- Поколачивание кулаками

**Вибрация:**
- Сотрясение ягодичных мышц
- Встряхивание

#### 5. Живот (7 минут)
- Круговое поглаживание по часовой стрелке
- Спиралевидное растирание с нажимом
- Щипковое разминание подкожно-жировой клетчатки
- Валяние косых мышц
- Вибрация области кишечника

#### 6. Завершение (3 минуты)
- Лимфодренажное поглаживание от периферии к центру
- Лёгкие похлопывания
- Успокаивающие движения

## Важные техники

### Щипковый массаж
1. Захватывать кожу и подкожную клетчатку
2. Оттягивать и прокатывать между пальцами
3. Двигаться снизу вверх
4. Интенсивность: ощутимо, но не болезненно

### Накатывание на кулак
1. Собрать кулак
2. Второй рукой накатывать ткани на кулак
3. Перемещаться по всей зоне
4. Разбивает жировые отложения

### Глубокое разминание
1. Захватить мышцу двумя руками
2. Сжать и оттянуть от кости
3. Перебирать мышцу как тесто
4. Работать с максимальной глубиной

## Направления движений
- **Бёдра:** снизу вверх, от колена к ягодице
- **Ягодицы:** от центра к периферии, снизу вверх
- **Живот:** по часовой стрелке (направление кишечника)
- **Лимфодренаж:** всегда к ближайшим лимфоузлам

## Рекомендации
- Курс: 10-15 процедур
- Частота: 2-3 раза в неделю
- Сочетать с обёртываниями
- Пить много воды после процедуры`,
      ro: `## Protocol de masaj anticelulitic

### Secvența de execuție

#### 1. Etapa preparatorie (5 minute)
- Mângâiere de încălzire a întregii zone
- Frecare ușoară cu palmele
- Activarea circulației sanguine

#### 2. Coapse - suprafața posterioară (15 minute)
**Frământare profundă:**
- Prindere și stoarcere a mușchilor de jos în sus
- Rulare cu presiune
- Stoarcere cu vârfurile degetelor
- Mișcări de ciupit (ciupire)

**Frecare:**
- Ferăstrău cu marginile palmelor (intensiv)
- Circulară cu presiune cu nodurile degetelor
- Spiralată cu două mâini în mișcări opuse

**Tehnici de percuție:**
- Tăiere cu marginile palmelor (2-3 minute)
- Tapotament cu palmele (intensificat)
- Ciocănire cu pumnii

#### 3. Coapse - suprafața laterală ("breeches") (10 minute)
- Frământare profundă cu prindere
- Frecare intensivă cu nodurile degetelor
- Masaj prin ciupire
- Tăvălire pe pumn
- Tăiere de-a lungul liniei coapsei

#### 4. Fese (10 minute)
**Frământare:**
- Circulară cu două mâini
- Deplasare și întindere
- Tăvălire pe pumn

**Tehnici de percuție:**
- Tapotament intensiv
- Tăiere încrucișată
- Ciocănire cu pumnii

**Vibrație:**
- Scuturare a mușchilor fesieri
- Agitare

#### 5. Abdomen (7 minute)
- Mângâiere circulară în sensul acelor de ceasornic
- Frecare spiralată cu presiune
- Frământare prin ciupire a țesutului adipos subcutanat
- Rulare a mușchilor oblici
- Vibrație în zona intestinală

#### 6. Finalizare (3 minute)
- Mângâiere de drenaj limfatic de la periferie spre centru
- Tapotamente ușoare
- Mișcări calmante

## Tehnici importante

### Masaj prin ciupire
1. Prinde pielea și țesutul subcutanat
2. Trage și rostogolește între degete
3. Deplasează-te de jos în sus
4. Intensitate: simțită, dar nu dureroasă

### Tăvălire pe pumn
1. Formează pumnul
2. Cu cealaltă mână rulează țesuturile pe pumn
3. Deplasează-te pe toată zona
4. Descompune depozitele de grăsime

### Frământare profundă
1. Prinde mușchiul cu ambele mâini
2. Strânge și trage de os
3. Frământă mușchiul ca aluatul
4. Lucrează cu adâncime maximă

## Direcții ale mișcărilor
- **Coapse:** de jos în sus, de la genunchi la fese
- **Fese:** de la centru spre periferie, de jos în sus
- **Abdomen:** în sensul acelor de ceasornic (direcția intestinului)
- **Drenaj limfatic:** întotdeauna spre cei mai apropiați ganglioni limfatici

## Recomandări
- Cură: 10-15 proceduri
- Frecvență: 2-3 ori pe săptămână
- Combină cu înfășurări
- Bea multă apă după procedură`,
    },
  },

  // Продолжение следует... Из-за ограничения длины, создам следующую часть
]

async function migrateProtocolsStructure() {
  try {
    console.log('🔄 Starting massage protocols structure migration...')

    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connected successfully')

    let updated = 0
    let notFound = 0

    for (const update of protocolUpdates) {
      const protocol = await MassageProtocol.findOne({ slug: update.slug })

      if (protocol) {
        protocol.content = update.content
        protocol.technique = update.technique
        await protocol.save()
        console.log(`✅ Updated: ${update.slug}`)
        updated++
      } else {
        console.log(`⚠️  Not found: ${update.slug}`)
        notFound++
      }
    }

    console.log(`\n📊 Migration completed:`)
    console.log(`  - Updated: ${updated} protocol(s)`)
    console.log(`  - Not found: ${notFound} protocol(s)`)
    console.log(`  - Total: ${protocolUpdates.length} protocol(s)`)

    await mongoose.disconnect()
    console.log('\n✅ Database disconnected')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

migrateProtocolsStructure()
