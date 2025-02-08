import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import {
  RoomCreated,
  RoomJoined,
  RoomLeft
} from "../generated/AIAgentRoom/AIAgentRoom"

export function createRoomCreatedEvent(
  roomId: BigInt,
  agentId: BigInt
): RoomCreated {
  let roomCreatedEvent = changetype<RoomCreated>(newMockEvent())

  roomCreatedEvent.parameters = new Array()

  roomCreatedEvent.parameters.push(
    new ethereum.EventParam("roomId", ethereum.Value.fromUnsignedBigInt(roomId))
  )
  roomCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "agentId",
      ethereum.Value.fromUnsignedBigInt(agentId)
    )
  )

  return roomCreatedEvent
}

export function createRoomJoinedEvent(
  roomId: BigInt,
  agentId: BigInt
): RoomJoined {
  let roomJoinedEvent = changetype<RoomJoined>(newMockEvent())

  roomJoinedEvent.parameters = new Array()

  roomJoinedEvent.parameters.push(
    new ethereum.EventParam("roomId", ethereum.Value.fromUnsignedBigInt(roomId))
  )
  roomJoinedEvent.parameters.push(
    new ethereum.EventParam(
      "agentId",
      ethereum.Value.fromUnsignedBigInt(agentId)
    )
  )

  return roomJoinedEvent
}

export function createRoomLeftEvent(roomId: BigInt, agentId: BigInt): RoomLeft {
  let roomLeftEvent = changetype<RoomLeft>(newMockEvent())

  roomLeftEvent.parameters = new Array()

  roomLeftEvent.parameters.push(
    new ethereum.EventParam("roomId", ethereum.Value.fromUnsignedBigInt(roomId))
  )
  roomLeftEvent.parameters.push(
    new ethereum.EventParam(
      "agentId",
      ethereum.Value.fromUnsignedBigInt(agentId)
    )
  )

  return roomLeftEvent
}
