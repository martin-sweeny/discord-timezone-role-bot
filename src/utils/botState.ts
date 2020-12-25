import log from './log'

export enum BotStates {
	Bored,
	Waiting,
}

export default class BotStateManager {
	private _state
	private _defaultState = BotStates.Bored

	constructor() {
		this.state = this._defaultState
	}

	public get state() {
		return this._state
	}

	public set state(newState: BotStates) {
		log('Setting bot state to:\t', newState)
		this._state = newState
	}

	public resetState() {
		log('Clean state reset')
		this.state = this._defaultState
	}

	public isDefaultState() {
		return this._state === this._defaultState
	}

	public isWaiting() {
		return this._state === BotStates.Waiting
	}
}
