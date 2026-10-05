import { db } from "../models/db.js";
import { PlaylistSpec, TrackSpec } from "../models/joi-schemas.js";

export const playlistController = {

  index: {
    handler: async function (request, h) {
      const playlist = await db.playlistStore.getPlaylistById(request.params.id);
      const viewData = {
        title: "Playlist",
        playlist: playlist,
      };
      return h.view("playlist", viewData);
    },
  },

  addTrack: {
    validate: {
      payload: TrackSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const playlist = await db.playlistStore.getPlaylistById(request.params.id);
        return h.view("playlist", { title: "Add track error", playlist, errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const playlist = await db.playlistStore.getPlaylistById(request.params.id);
      const newTrack = {
        title: request.payload.title,
        artist: request.payload.artist,
        duration: Number(request.payload.duration),
      };
      await db.trackStore.addTrack(playlist._id, newTrack);
      return h.redirect(`/playlist/${playlist._id}`);
    },
  },




  deleteTrack: {
    handler: async function (request, h) {
      const playlist = await db.playlistStore.getPlaylistById(request.params.id);
      await db.trackStore.deleteTrack(request.params.trackid);
      return h.redirect(`/playlist/${playlist._id}`);
    },
  },

  addPlaylist: {
    validate: {
      payload: PlaylistSpec,
      failAction: function (request, h, error) {
        const playlists = db.playlistStore.getUserPlaylists(request.auth.credentials._id);
        return h
          .view("dashboard", {
            title: "Add Playlist Error",
            playlists: playlists,
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const newPlaylist = {
        title: request.payload.title,
        userid: request.auth.credentials._id,
      };

      await db.playlistStore.addPlaylist(newPlaylist);
      return h.redirect("/dashboard");
    },
  },

};
