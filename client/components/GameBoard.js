import React, {Component} from 'react'
import PlayerCard from './PlayerCard'
import ChatLog from './ChatLog'
import Battle from './Battle'
import ButtonPanel from './ButtonPanel'
import ImageMapper from 'react-image-mapper'
import socket from '../socket'

let {log, Game, appendMethods} = require('../gameLogic')

export default class GameBoard extends Component {
  constructor() {
    super()
    this.state = {
      game: {
        players: [],
        currentPlayer: {},
        playerOrder: [],
        isActive: false,
        battle: {
          isActive: false
        }
      },
      players: ['Yang', 'Oz', 'Graham', 'Raymond']
    }
    this.startGame = this.startGame.bind(this)
    this.endTurn = this.endTurn.bind(this)
    this.knockKnock = this.knockKnock.bind(this)
    this.fight = this.fight.bind(this)
    this.flee = this.flee.bind(this)
    this.lootRoom = this.lootRoom.bind(this)
    this.discard = this.discard.bind(this)
    this.equip = this.equip.bind(this)
    this.unequip = this.unequip.bind(this)
    this.cast = this.cast.bind(this)
  }

  startGame() {
    if (!this.state.players.length) return log('There are no players!')
    const game = new Game(this.state.players)
    this.setState({
      game
    })
    // socket.emit('startGame', game)
  }

  knockKnock() {
    const {game} = this.state
    game.knockKnock()
    this.setState({
      game
    })
  }

  detachSelf = game => {
    game.battle.game = null
    game.playerOrder.forEach(player => (player.game = null))
    return game
  }

  reattachSelf = game => {
    game.battle.game = game
    game.playerOrder.forEach(player => (player.game = game))
    return game
  }

  componendDidMount() {
    const audioNode = document.getElementById('boardAudio')
    console.log('Hello audio!!', audioNode)
    audioNode.play()
    // socket.on('gameStarted', game => {
    //   console.log(game)
    //   this.setState({
    //     game
    //   })
    //   console.log(this.state, 'after payload<><><><><><><><><>')
    // })
    const {game} = this.state
    game = appendMethods.game(game)
    game.playerOrder.map(player => {
      return appendMethods.player(player)
    })
    game.battle = appendMethods.battle(game.battle)
    this.setState({game})
  }

  fight() {
    const {game} = this.state
    game.battle = appendMethods.battle(game.battle)
    game.battle.resolve()
    this.setState({
      game
    })
  }

  flee() {
    const {game} = this.state
    game.battle = appendMethods.battle(game.battle)
    game.battle.flee()
    this.setState({
      game
    })
  }

  lootRoom() {
    const {game} = this.state
    game.lootRoom()
    this.setState({
      game
    })
  }

  endTurn() {
    const {game} = this.state
    game.endTurn()
    this.setState({
      game
    })
  }

  discard(player, cardIdx) {
    const {game} = this.state
    player.discard(cardIdx)
    this.setState({
      game
    })
  }

  equip = (player, cardIdx) => {
    const {game} = this.state
    const item = player.hand[cardIdx]
    player.equip(cardIdx)
    this.setState({
      game
    })
  }

  unequip = (player, ___, item) => {
    const {game} = this.state
    player.unequip(item)
    this.setState({
      game
    })
  }

  equipToHireling = (player, card) => {
    const {game} = this.state
    player.equipToHireling(card)
    this.setState({
      game
    })
  }

  cast = (player, cardIdx, target) => {
    const {game} = this.state
    player.cast(cardIdx, target)
    this.setState({
      game
    })
  }

  lookForTrouble = monster => {
    const {game} = this.state
    game.startBattle(monster)
    const {hand} = game.currentPlayer
    hand.splice(hand.indexOf(monster), 1)
    this.setState({
      game
    })
  }

  assist = player => {
    const {game} = this.state
    player.assist()
    this.setState({
      game
    })
  }

  render() {
    const {game} = this.state
    const MAP = {
      name: 'door',
      areas: [{shape: 'rect', coords: [28, 503, 128, 564]}]
    }
    return (
      <div className="gameboard-container">
        <div>
          {game.isActive ? (
            <div>
              {game.playerOrder.map(player => {
                return (
                  <PlayerCard
                    key={player.name}
                    player={player}
                    game={game}
                    discard={this.discard}
                    equip={this.equip}
                    unequip={this.unequip}
                    cast={this.cast}
                    lookForTrouble={this.lookForTrouble}
                    equipToHireling={this.equipToHireling}
                    assist={this.assist}
                  />
                )
              })}
            </div>
          ) : (
            <img
              alt="gameboard"
              src="http://www.worldofmunchkin.com/lite/img/backcover_lg.jpg"
            />
          )}
        </div>
        <div>
          {game.battle.isActive ? (
            <Battle battle={game.battle} />
          ) : (
            <div>
              <ImageMapper
                src={
                  'http://www.worldofmunchkin.com/gameboard/img/cover_lg.jpg'
                }
                map={MAP}
                onClick={
                  game.phase === 1
                    ? this.knockKnock
                    : game.phase === 2 ? this.lootRoom : null
                }
              />
              {/* <img
                  alt="gameboard"
                  style={{width: '100%'}}
                  src="http://www.worldofmunchkin.com/gameboard/img/cover_lg.jpg"
                /> */}
              <audio autoPlay loop id="boardAudio">
                <source src="./music/theJourney.mp3" type="audio/mp3" />
              </audio>
            </div>
          )}
          <hr />
          <ButtonPanel
            game={game}
            startGame={this.startGame}
            knockKnock={this.knockKnock}
            fight={this.fight}
            flee={this.flee}
            lootRoom={this.lootRoom}
            endTurn={this.endTurn}
          />
        </div>
        <div>
          <ChatLog />
        </div>
      </div>
    )
  }
}
