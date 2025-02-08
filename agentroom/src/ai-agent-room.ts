import {
  RoomCreated as RoomCreatedEvent,
  RoomJoined as RoomJoinedEvent,
  RoomLeft as RoomLeftEvent
} from "../generated/AIAgentRoom/AIAgentRoom"
import { RoomCreated, RoomJoined, RoomLeft } from "../generated/schema"

export function handleRoomCreated(event: RoomCreatedEvent): void {
  let entity = new RoomCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.roomId = event.params.roomId
  entity.agentId = event.params.agentId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoomJoined(event: RoomJoinedEvent): void {
  let entity = new RoomJoined(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.roomId = event.params.roomId
  entity.agentId = event.params.agentId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoomLeft(event: RoomLeftEvent): void {
  let entity = new RoomLeft(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.roomId = event.params.roomId
  entity.agentId = event.params.agentId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
