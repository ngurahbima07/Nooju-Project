<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    public function getCommentsByBooking($bookingId)
    {
        $comments = Comment::where('booking_id', $bookingId)->orderBy('created_at', 'desc')->get();
        return response()->json($comments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bookingId' => 'required|exists:reservations,id',
            'comment' => 'required|string',
        ]);

        $comment = Comment::create([
            'booking_id' => $request->bookingId,
            'comment' => $request->comment,
        ]);

        return response()->json($comment, 201);
    }
    
    public function destroy($id)
{
    $comment = \App\Models\Comment::find($id);
    if (!$comment) {
        return response()->json(['message' => 'Komentar tidak ditemukan'], 404);
    }
    $comment->delete();
    return response()->json(['message' => 'Komentar berhasil dihapus']);
}

}
