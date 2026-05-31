import 'dotenv/config'
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(
	process.env.MY_SQL_DATABASE,
	process.env.MY_SQL_USER,
	process.env.MY_SQL_PASSWORD,
	{
		host: process.env.MY_SQL_HOST,
		port: process.env.MY_SQL_PORT,
		dialect: 'mysql',
		logging: false
	}
)

sequelize
	.authenticate()
	.then(() => console.log('DB connection succeeded.'))
	.catch(err => console.error('DB connection failed:', err))

export default sequelize
