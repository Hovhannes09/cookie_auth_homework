# MySQL — Նշումներ

> Բոլոր օրինակները պատրաստ են copy-paste անելու և անմիջապես գործարկելու համար։

---

## 0. Նախապատրաստում — Database

```sql
CREATE DATABASE school_demo;
USE school_demo;
```

---

## 1. Self JOIN

`<Self JOIN>`-ը օգտագործվում է այն դեպքում երբ անհրաժեշտ է աղյուսակը կապել ինքն իրեն։

### Աղյուսակի ստեղծում

```sql
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerName VARCHAR(50),
    City VARCHAR(50)
);
```

### Տվյալների ավելացում

```sql
INSERT INTO Customers (CustomerName, City) VALUES
('Արամ',    'Երևան'),
('Անի',     'Երևան'),
('Դավիթ',   'Գյումրի'),
('Մարիամ',  'Գյումրի'),
('Տիգրան',  'Վանաձոր'),
('Լուսինե', 'Երևան');
```

### Self JOIN օրինակ

```sql
SELECT A.CustomerName AS cm1,
       B.CustomerName AS cm2,
       A.City AS c
FROM Customers A, Customers B
WHERE A.CustomerID <> B.CustomerID
  AND A.City = B.City;
```

**Արդյունք՝** կստանանք բոլոր այն հաճախորդների զույգերը, որոնք ապրում են նույն քաղաքում։

---

## 2. UNION

`<UNION>`-ը օգտագործվում է մի քանի աղյուսակներից ստացված արդյունքը մի տեղ միավորելու համար։

### Աղյուսակների ստեղծում

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50)
);

-- Customers աղյուսակը արդեն ստեղծված է վերևում
-- ավելացնենք last_name սյունը՝ երկրորդ օրինակի համար
ALTER TABLE Customers ADD COLUMN last_name VARCHAR(50);
```

### Տվյալների ավելացում

```sql
INSERT INTO users (name) VALUES
('Արթուր'),
('Անի'),
('Գոռ');

UPDATE Customers SET last_name = 'Հակոբյան'   WHERE CustomerName = 'Արամ';
UPDATE Customers SET last_name = 'Սարգսյան'   WHERE CustomerName = 'Անի';
UPDATE Customers SET last_name = 'Պետրոսյան'  WHERE CustomerName = 'Դավիթ';
UPDATE Customers SET last_name = 'Գրիգորյան'  WHERE CustomerName = 'Մարիամ';
UPDATE Customers SET last_name = 'Մարտիրոսյան' WHERE CustomerName = 'Տիգրան';
UPDATE Customers SET last_name = 'Ավետիսյան'  WHERE CustomerName = 'Լուսինե';
```

### UNION օրինակ 1 — նույն անունով սյուներ

```sql
SELECT CustomerName AS name FROM Customers
UNION
SELECT name FROM users;
```

> **Կարևոր է**, որ ստացվող արդյունքների սյուների **քանակը** և **հերթականությունը** նույնը լինեն։

### UNION օրինակ 2 — տարբեր անունով սյուներ (AS ալիասով)

```sql
SELECT last_name AS name FROM Customers
UNION
SELECT name FROM users;
```

### UNION vs UNION ALL

```sql
-- UNION — հեռացնում է կրկնվող տողերը
SELECT CustomerName FROM Customers
UNION
SELECT name FROM users;

-- UNION ALL — ցույց է տալիս բոլոր տողերը (նաև կրկնվողները)
SELECT CustomerName FROM Customers
UNION ALL
SELECT name FROM users;
```

---

## 3. Աղյուսակների տեսակները (Storage Engines)

MySQL-ում աղյուսակներն ունեն մի քանի տեսակներ (storage engines), որոնցից յուրաքանչյուրը նախատեսված է որոշակի խնդիրների համար։

### MyISAM
Հին և արագ շարժիչ, որը լավ է աշխատում հիմնականում կարդալու (read) գործողությունների ժամանակ։ Չի աջակցում տրանզակցիաներ և օտար բանալիներ (FOREIGN KEY)։

### InnoDB
Ժամանակակից և ամենից շատ օգտագործվող շարժիչը։ Աջակցում է **տրանզակցիաներ** (ACID), **օտար բանալիներ** (FOREIGN KEY), row-level locking։ MySQL-ի կանխադրված շարժիչն է։

### MERGE
Թույլ է տալիս մի քանի միանման MyISAM աղյուսակներ դիտել որպես մեկ աղյուսակ։ Հարմար է մեծ տվյալների բաժանված պահպանման համար։

### MEMORY
Տվյալները պահվում են միայն օպերատիվ հիշողության մեջ (RAM)։ Շատ արագ է, բայց սերվերի վերագործարկման ժամանակ տվյալները ջնջվում են։

### BDB (BerkeleyDB)
Տրանզակցիոն շարժիչ, որն այլևս չի աջակցվում MySQL-ի նոր տարբերակներում։

### EXAMPLE
"Դատարկ" շարժիչ է, որն օգտագործվում է որպես օրինակ ծրագրավորողների համար։ Տվյալներ չի պահում։

### FEDERATED
Թույլ է տալիս կապ ստեղծել մեկ այլ (հեռավոր) MySQL սերվերի աղյուսակների հետ՝ առանց տվյալները տեղական պահելու։

### ARCHIVE
Նախատեսված է մեծ քանակությամբ պատմական տվյալներ սեղմված ձևով պահելու համար։ Աջակցում է միայն `INSERT` և `SELECT` գործողություններ։

### BLACKHOLE
Աղյուսակն ընդունում է տվյալներ, բայց ոչինչ չի պահում (նման է `/dev/null`-ի)։ Հիմնականում օգտագործվում է replication-ի համար։

### CSV
Տվյալները պահվում են CSV ֆայլի տեսքով։ Հարմար է, երբ տվյալները պետք է փոխանակվեն այլ ծրագրերի (օրինակ Excel-ի) հետ։

### Շարժիչը նշելու օրինակ

```sql
CREATE TABLE example_table (
    id INT PRIMARY KEY,
    name VARCHAR(50)
) ENGINE=InnoDB;

-- Տեսնել բոլոր հասանելի շարժիչները
SHOW ENGINES;
```

---

## 4. FOREIGN KEY

`<FOREIGN KEY>`-ը օգտագործվում է երկու աղյուսակների դաշտեր միմյանց կապելու համար։

`<FOREIGN KEY>`-ով կապվում է աղյուսակի մեկ դաշտը մյուս աղյուսակի `<PRIMARY KEY>`-ով դաշտի հետ։

> **Պարտադիր է**, որ երկու դաշտերն էլ լինեն միանման (տիպը, չափը...)։

### Աղյուսակների ստեղծում FOREIGN KEY-ով

```sql
-- Հիմնական (parent) աղյուսակ
CREATE TABLE Persons (
    PersonID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50)
);

-- Կապված (child) աղյուսակ՝ FOREIGN KEY-ով
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    OrderNumber INT NOT NULL,
    PersonID INT,
    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
);
```

### Տվյալների ավելացում

```sql
INSERT INTO Persons (FirstName, LastName) VALUES
('Արամ',   'Հակոբյան'),
('Անի',    'Սարգսյան'),
('Դավիթ',  'Պետրոսյան');

INSERT INTO Orders (OrderNumber, PersonID) VALUES
(1001, 1),
(1002, 1),
(1003, 2),
(1004, 3);
```

### Ստուգում JOIN-ով

```sql
SELECT o.OrderID, o.OrderNumber, p.FirstName, p.LastName
FROM Orders o
JOIN Persons p ON o.PersonID = p.PersonID;
```

### FOREIGN KEY ավելացնել արդեն գոյություն ունեցող աղյուսակին

```sql
ALTER TABLE Orders
ADD CONSTRAINT fk_person
FOREIGN KEY (PersonID) REFERENCES Persons(PersonID);
```

### FOREIGN KEY-ը հեռացնել

```sql
ALTER TABLE Orders
DROP FOREIGN KEY fk_person;
```

### ON DELETE / ON UPDATE օրինակ

```sql
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    OrderNumber INT NOT NULL,
    PersonID INT,
    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
```

> **CASCADE** — եթե parent աղյուսակում գրառումը ջնջվի/փոխվի, ապա child աղյուսակում նույնպես կջնջվի/կփոխվի։
> Այլ տարբերակներ՝ `SET NULL`, `RESTRICT`, `NO ACTION`։

### Ստուգման տեստ (FOREIGN KEY-ը աշխատում է)

```sql
-- Սա կաշխատի — PersonID = 1 գոյություն ունի
INSERT INTO Orders (OrderNumber, PersonID) VALUES (2001, 1);

-- Սա ՍԽԱԼ կտա — PersonID = 999 գոյություն չունի
INSERT INTO Orders (OrderNumber, PersonID) VALUES (2002, 999);
```

---

## 5. Մաքրում (cleanup)

```sql
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Persons;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS users;
DROP DATABASE IF EXISTS school_demo;
```
