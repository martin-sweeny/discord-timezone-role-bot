export default (...message) => {
	if (process.env.DEBUG) console.log(...message)
}
