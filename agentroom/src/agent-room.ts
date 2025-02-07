import {
  RoomCreated as RoomCreatedEvent,
  RoomFull as RoomFullEvent,
  RoomLeft as RoomLeftEvent
} from "../generated/AgentRoom/AgentRoom"
import { RoomCreated, RoomFull, RoomLeft } from "../generated/schema"

export function handleRoomCreated(event: RoomCreatedEvent): void {
  let entity = new RoomCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.roomId = event.params.roomId
  entity.roomType = event.params.roomType
  entity.agentID = event.params.agentID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoomFull(event: RoomFullEvent): void {
  let entity = new RoomFull(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.roomId = event.params.roomId
  entity.roomType = event.params.roomType
  entity.agentIDs = event.params.agentIDs

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
  entity.roomType = event.params.roomType
  entity.agentID = event.params.agentID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
