import { DataTypes } from 'sequelize'
import sequelize from '../clients/db.mysql.js'
import _ from 'lodash'

const Customer = sequelize.define(
	'Customer',
	{
		CustomerID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		CustomerName: { type: DataTypes.STRING(50), allowNull: false },
		City: { type: DataTypes.STRING(50), allowNull: false },
		last_name: { type: DataTypes.STRING(50), allowNull: true }
	},
	{
		tableName: 'Customers',
		timestamps: false
	}
)

export async function getAll() {
	try {
		return await Customer.findAll({ order: [['CustomerID', 'ASC']] })
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function getSameCity() {
	try {
		const [rows] = await sequelize.query(
			`SELECT A.CustomerName AS cm1,
              B.CustomerName AS cm2,
              A.City         AS c
       FROM Customers A, Customers B
       WHERE A.CustomerID <> B.CustomerID
         AND A.City = B.City
       ORDER BY c, cm1, cm2`
		)
		return rows
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function create({ CustomerName, City, last_name }) {
	try {
		const customer = await Customer.create({
			CustomerName,
			City,
			last_name: _.defaultTo(last_name, null)
		})
		return customer.CustomerID
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function remove(id) {
	try {
		const count = await Customer.destroy({ where: { CustomerID: id } })
		return count
	} catch (error) {
		console.error(error)
		return null
	}
}

export default { getAll, getSameCity, create, remove }
