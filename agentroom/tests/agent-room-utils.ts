import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import {
  RoomCreated,
  RoomFull,
  RoomLeft
} from "../generated/AgentRoom/AgentRoom"

export function createRoomCreatedEvent(
  roomId: BigInt,
  roomType: i32,
  agentID: BigInt
): RoomCreated {
  let roomCreatedEvent = changetype<RoomCreated>(newMockEvent())

  roomCreatedEvent.parameters = new Array()

  roomCreatedEvent.parameters.push(
    new ethereum.EventParam("roomId", ethereum.Value.fromUnsignedBigInt(roomId))
  )
  roomCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "roomType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(roomType))
    )
  )
  roomCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "agentID",
      ethereum.Value.fromUnsignedBigInt(agentID)
    )
  )

  return roomCreatedEvent
}

export function createRoomFullEvent(
  roomId: BigInt,
  roomType: i32,
  agentIDs: Array<BigInt>
): RoomFull {
  let roomFullEvent = changetype<RoomFull>(newMockEvent())

  roomFullEvent.parameters = new Array()

  roomFullEvent.parameters.push(
    new ethereum.EventParam("roomId", ethereum.Value.fromUnsignedBigInt(roomId))
  )
  roomFullEvent.parameters.push(
    new ethereum.EventParam(
      "roomType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(roomType))
    )
  )
  roomFullEvent.parameters.push(
    new ethereum.EventParam(
      "agentIDs",
      ethereum.Value.fromUnsignedBigIntArray(agentIDs)
    )
  )

  return roomFullEvent
}

export function createRoomLeftEvent(
  roomId: BigInt,
  roomType: i32,
  agentID: BigInt
): RoomLeft {
  let roomLeftEvent = changetype<RoomLeft>(newMockEvent())

  roomLeftEvent.parameters = new Array()

  roomLeftEvent.parameters.push(
    new ethereum.EventParam("roomId", ethereum.Value.fromUnsignedBigInt(roomId))
  )
  roomLeftEvent.parameters.push(
    new ethereum.EventParam(
      "roomType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(roomType))
    )
  )
  roomLeftEvent.parameters.push(
    new ethereum.EventParam(
      "agentID",
      ethereum.Value.fromUnsignedBigInt(agentID)
    )
  )

  return roomLeftEvent
}
