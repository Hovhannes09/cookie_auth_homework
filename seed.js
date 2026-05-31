import DbMysql from './clients/db.mysql.js'

async function seed() {
	try {
		await DbMysql.query(`
            INSERT INTO Customers (CustomerName, City, last_name) VALUES
            ('Արամ',    'Երևան',   'Գրիգորյան'),
            ('Անի',     'Երևան',   'Սահակյան'),
            ('Լուսինե', 'Երևան',   'Պետրոսյան'),
            ('Դավիթ',   'Գյումրի', 'Հակոբյան'),
            ('Նարե',    'Գյումրի', 'Ավետիսյան'),
            ('Գոռ',     'Վանաձոր', 'Մկրտչյան')
        `)
		console.log('-> customers seeded')

		await DbMysql.query(`
            INSERT INTO directory_users (name) VALUES
            ('Արթուր'),
            ('Անի'),
            ('Գոռ')
        `)
		console.log('-> directory_users seeded')

		await DbMysql.query(`
            INSERT INTO Persons (FirstName, LastName) VALUES
            ('Հովհաննես', 'Գրիգորյան'),
            ('Մարիամ',    'Հակոբյան'),
            ('Տիգրան',    'Սահակյան')
        `)
		console.log('-> persons seeded')

		await DbMysql.query(`
            INSERT INTO Orders (OrderNumber, PersonID) VALUES
            (101, 1),
            (102, 1),
            (103, 2),
            (104, 3)
        `)
		console.log('-> orders seeded')

		console.log('Seed completed!')
		process.exit(0)
	} catch (error) {
		console.error('Seed failed:', error)
		process.exit(1)
	}
}
