import log from './log'

let timeout: NodeJS.Timeout

export default class TimerManager {
	private _callback: Function
	private _delay: number
	private _timeout: number

	public constructor(delay?: number, cb?: Function) {
		this._delay = delay
		this._callback = cb
	}

	public set delay(delay: number) {
		this._delay = delay
	}

	public get delay() {
		return this._delay
	}

	public set callback(cb: Function) {
		this._callback = cb
	}

	public get callback() {
		return this._callback
	}

	public start() {
		log('Setting timeout...')
		this._timeout = setTimeout(this._callback, this._delay)
		log('Timeout set:\t' + this._timeout)
	}

	public reset() {
		log('Resetting timeout:\t' + this._timeout)

		this.clear()
		this.start()
	}

	public clear() {
		log('Clearing timeout:\t' + this._timeout)
		clearTimeout(this._timeout)
	}
}
