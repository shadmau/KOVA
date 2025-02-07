import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { RoomCreated } from "../generated/schema"
import { RoomCreated as RoomCreatedEvent } from "../generated/AgentRoom/AgentRoom"
import { handleRoomCreated } from "../src/agent-room"
import { createRoomCreatedEvent } from "./agent-room-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let roomId = BigInt.fromI32(234)
    let roomType = 123
    let agentID = BigInt.fromI32(234)
    let newRoomCreatedEvent = createRoomCreatedEvent(roomId, roomType, agentID)
    handleRoomCreated(newRoomCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("RoomCreated created and stored", () => {
    assert.entityCount("RoomCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "RoomCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "roomId",
      "234"
    )
    assert.fieldEquals(
      "RoomCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "roomType",
      "123"
    )
    assert.fieldEquals(
      "RoomCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "agentID",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
