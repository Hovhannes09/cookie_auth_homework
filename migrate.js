import sequelize from './clients/db.mysql.js'

import './models/appUsers.js'
import './models/customers.js'
import './models/directoryUsers.js'
import './models/persons.js'
import './models/orders.js'

export async function migrate() {
	console.log('Running migration...')

	await sequelize.sync({ alter: true })

	console.log('-> app_users table successfully created')
	console.log('-> customers table successfully created')
	console.log('-> directory_users table successfully created')
	console.log('-> persons table successfully created')
	console.log('-> orders table successfully created')
	console.log('Migration finished successfully.')
}
