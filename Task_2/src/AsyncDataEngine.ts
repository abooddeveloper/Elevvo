interface GeoCoordinates {
lat: string;
lng: string;
}
interface CompanyDetails {
name: string;
catchPhrase: string;
bs: string;
}
interface User{
  id: number;
name: string;
email: string;
address: {
street: string;
suite: string;
city: string;
zipcode: string;
geo: GeoCoordinates;
};
phone: string;
website: string;
company: CompanyDetails;
}
interface ProcessedUser {
userId: number;
fullName: string;
corporateEmail: string;
location: string;
phoneNumber: string;
}
function mappingUsers  (user: User): ProcessedUser {
    return {
userId: user.id,
fullName: user.name,
corporateEmail: user.email.toLowerCase(),
location: `${user.address.city}, ${user.address.street}`,
phoneNumber: user.phone,

}}
interface Post{
     "userId": number,
    "id": number,
    "title": string,
    "body": string
}
interface ProcessedPost{
    "PostUserId": number,
    "PostId": number,
    "PostTitle": string,
    "PostBody": string
}
function mappingPosts  (post: Post): ProcessedPost {
    return {
        PostUserId: post.userId,
        PostId: post.id,
        PostTitle: post.title,
        PostBody: post.body
    };
}

interface Comment{
    "postId": number,
    "id": number,
    "name": string,
    "email": string,
    "body": string
}
interface ProcessedComment{
    "CommentPostId": number,
    "CommentId": number,
    "CommentName": string,
    "CommentEmail": string,
    "CommentBody": string
}
function mappingComments  (comment: Comment): ProcessedComment {
    return {
        CommentPostId: comment.postId,
        CommentId: comment.id,
        CommentName: comment.name,
        CommentEmail: comment.email,
        CommentBody: comment.body
    };
}
async function fetchAndProcess<T, R>(
    endpoint: string,
    mapper: (data: T) => R
): Promise<R[]> {

    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    const rawData = await response.json() as T[];

    return rawData.map(mapper);
}
async function main() {

    const usersPromise = fetchAndProcess(
        "https://jsonplaceholder.typicode.com/users",
        mappingUsers
    );

    const postsPromise = fetchAndProcess(
        "https://jsonplaceholder.typicode.com/posts",
        mappingPosts
    );

    const commentsPromise = fetchAndProcess(
        "https://jsonplaceholder.typicode.com/comments",
        mappingComments
    );

    const results = await Promise.allSettled([
        usersPromise,
        postsPromise,
        commentsPromise
    ]);

    results.forEach((result) => {
        if (result.status === "fulfilled") {
            console.log("Data fetched successfully:", result.value);
        } else {
            console.error("Request failed:", result.reason);
        }
    });
}

main();



