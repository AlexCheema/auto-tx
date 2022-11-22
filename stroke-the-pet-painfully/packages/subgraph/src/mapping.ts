import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  DemoPetStroker,
  PetJustStroked,
} from "../generated/DemoPetStroker/DemoPetStroker";
import { PetStrokes, Sender } from "../generated/schema";

export function handleStrokeThePet(event: PetJustStroked): void {
  let senderString = event.params.sender.toHexString();

  let sender = Sender.load(senderString);

  if (sender === null) {
    sender = new Sender(senderString);
    sender.address = event.params.sender;
    sender.createdAt = event.block.timestamp;
    sender.purposeCount = BigInt.fromI32(1);
  } else {
    sender.purposeCount = sender.purposeCount.plus(BigInt.fromI32(1));
  }

  let countPetStrokes = new PetStrokes(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  countPetStrokes.countPetStrokes = event.params.countPetStrokes;
  countPetStrokes.sender = senderString;
  countPetStrokes.createdAt = event.block.timestamp;
  countPetStrokes.transactionHash = event.transaction.hash.toHex();

  countPetStrokes.save();
  sender.save();
}
