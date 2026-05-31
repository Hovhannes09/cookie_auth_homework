import sequelize from './clients/db.mysql.js'

import './models/appUsers.js'
import './models/customers.js'
import './models/directoryUsers.js'
import './models/orders.js'
import './models/persons.js'

export async function migrate() {
	console.log('Running Migration')

	await sequelize.sync({ alter: true })

	console.log('Migration finished succeessfuly')
}
