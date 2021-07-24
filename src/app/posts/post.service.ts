import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from './post.model'
import { environment } from '../../environments/environment';

const HTTP_URL = environment.apiUrl + "/posts";

@Injectable({providedIn: 'root'})

export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPostsUpdatedListener() {
    return this.postsUpdated.asObservable();
  }


  // ** API METHODS ** //

  // returns a copy of a post object from the local post array based on postId provided
  getPost(postId: string) {
    return this.http
    .get<{ _id: string, title:string, content: string, imagePath: string, userId: string }>
              (HTTP_URL + "/" + postId);
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.http
      .get<{ message: string, posts: any, totalPosts: number }>(HTTP_URL + queryParams)
      .pipe(
        map((postData) => {                         // We have used all this code in pipe() bcoz Post model from angular has id but post from server has _id. The mismatching names would give errors and hence needs to be mapped correctly.
          return {
            posts: postData.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                userId: post.userId
              }
            }),
            totalPosts: postData.totalPosts
          };
        })
      )
      .subscribe((transformedPostData) => {
        // console.log(transformedPostData);
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.totalPosts
        });
      });
  }


  createPost(title: string, content: string, image: File) {
    // const post: Post = { id: null, title: title, content: content };
    const post = new FormData();
    post.append("title", title);
    post.append("content", content);
    post.append("image", image, title);  // the property name "image" enclosed in quotes should be the same as the property on the backend. This is the same property we're tyring to access on the backend.
                    // the 3rd argument we have passed above (title) is the filename which will be provided to the backend. Here we are using the name as the title the user entered for the post.

    this.http.post<{ message: string, post: Post }>(HTTP_URL, post)
      .subscribe((responseData) => {

        /* This code is not required since we are navigating to MyPosts page which has a GET call
        to the API which will refetch the latest updated posts. And hence we don't need to manually update
        the posts on the client side as shown in below commented code...
        const post: Post = { id: responseData.post.id,
          title: title,
          content: content,
          imagePath: responseData.post.imagePath
        };

        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        */

        this.router.navigate(["/"]);  // on successful creation of post in server, we navigate back to root url
      });
  }

  deletePost(postId: string) {
    return this.http.delete<{ message: string }>(HTTP_URL + "/" + postId);
  }

  updatePost(postId: string, title: string, content: string, image: File | string) {    // image can be any of 2 types: (1)string if string image is passed OR (2) File if a file is passed
    let post: Post | FormData;
    if(typeof(image) === 'object') {  // a file will always be an object
      post = new FormData();
      post.append("id", postId);
      post.append("title", title);
      post.append("content", content);
      post.append("image", image, title);
    }
    else {    // case of string image
      post = { id: postId, title: title, content: content, imagePath: image, userId: null };  // userId of post will be handled on the server for update
    }

    this.http.put<{ message: string }>(HTTP_URL + "/" + postId, post)
      .subscribe((responseData) => {
        this.router.navigate(["/"]);  // on successful update of post in server, we navigate back to root url
      });
  }
}
