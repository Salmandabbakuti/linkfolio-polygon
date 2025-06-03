import { store } from "@graphprotocol/graph-ts";
import {
  ProfileCreated as ProfileCreatedEvent,
  ProfileUpdated as ProfileUpdatedEvent,
  ProfileDeleted as ProfileDeletedEvent,
  NoteLeft as NoteLeftEvent,
  PostCreated as PostCreatedEvent
} from "../generated/LinkFolio/LinkFolio";
import { User, Profile, Note, Post } from "../generated/schema";

const ProfileCategories = ["Personal", "Creator", "Business"];

export function handleProfileCreated(event: ProfileCreatedEvent): void {
  const blockTimestamp = event.block.timestamp;
  const tokenId = event.params.tokenId;
  const owner = event.params.owner;
  const handle = event.params.handle;
  // Create user if not exists
  let user = User.load(owner.toHex());
  if (user == null) {
    user = new User(owner.toHex());
    user.address = owner.toHex();
    user.createdAt = blockTimestamp;
    user.save();
  }

  // Create profile
  let profile = new Profile(handle);
  profile.tokenId = tokenId;
  profile.name = event.params.name;
  profile.handle = handle;
  profile.category = ProfileCategories[event.params.category];
  profile.bio = event.params.bio;
  profile.avatar = event.params.avatar;
  profile.owner = owner.toHex();
  profile.linkKeys = event.params.linkKeys;
  profile.links = event.params.links;
  profile.createdAt = blockTimestamp;
  profile.updatedAt = blockTimestamp;
  profile.save();
}

export function handleProfileUpdated(event: ProfileUpdatedEvent): void {
  const handle = event.params.handle;
  const categoryString = ProfileCategories[event.params.category];
  let profile = Profile.load(handle);

  // Create profile if not exists with handle as id
  if (profile == null) {
    profile = new Profile(handle);
    profile.tokenId = event.params.tokenId;
    profile.name = event.params.name;
    profile.handle = handle;
    profile.category = categoryString;
    profile.owner = event.params.owner.toHex();
    profile.createdAt = event.block.timestamp;
  }

  // Update profile
  profile.name = event.params.name;
  profile.bio = event.params.bio;
  profile.category = categoryString;
  profile.avatar = event.params.avatar;
  profile.linkKeys = event.params.linkKeys;
  profile.links = event.params.links;
  profile.updatedAt = event.block.timestamp;
  profile.save();
}

export function handleProfileDeleted(event: ProfileDeletedEvent): void {
  const profileId = event.params.handle;
  let profile = Profile.load(profileId);
  if (profile) {
    store.remove("Profile", profileId);
  }
}

export function handleNoteLeft(event: NoteLeftEvent): void {
  let note = new Note(
    "note_" +
      event.params.tokenId.toString() +
      "-" +
      event.params.noteId.toString() +
      "-" +
      event.params.author.toHex()
  );
  note.to = event.params.handle;
  note.content = event.params.content;
  note.author = event.params.author;
  note.createdAt = event.block.timestamp;
  note.save();
}

export function handlePostCreated(event: PostCreatedEvent): void {
  let post = new Post(
    "post_" +
      event.params.tokenId.toString() +
      "-" +
      event.params.postId.toString()
  );
  post.content = event.params.content;
  post.author = event.params.handle;
  post.createdAt = event.block.timestamp;
  post.save();
}
