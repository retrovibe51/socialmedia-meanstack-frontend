import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

import { Post } from '../post.model';
import { PostService } from '../post.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

posts: Post[] = [];
isLoading = false;
totalPosts = 0;
postsPerPage = 2;
currentPage = 1;
postsPerPageOptions = [1, 2, 5, 10];
isUserAuthenticated = false;
userId: string;
private postsSubscription: Subscription;
private authListenerSubscription: Subscription

  constructor(public postService: PostService, public authService: AuthService) {  }

  ngOnInit(): void {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage); // this.postService refers to the property automatically created (since public keyword was added to parameter in constructor). It does not refer to the consructor parameter itself.
    this.userId = this.authService.getUserId();
    this.postsSubscription = this.postService.getPostsUpdatedListener()    // LHS (this.postsSubscription =) was not reqd for it to work, but we added it so that we can unsubscribe later.
      .subscribe((postData: { posts: Post[], postCount: number }) => {  // data received by subscribe (posts) is the posts array which is emitted by createPosts() in post.service.ts
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
    this.isUserAuthenticated = this.authService.getAuthStatus();
    this.authListenerSubscription = this.authService.getAuthStatusListener().subscribe((isAuthenticated) => {
      this.isUserAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();   // fetches null/undefined if user switches from authenticated to unauthenticated (logged out)
    });
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe(); // when the component is destroyed (removed from the DOM), we
                                          //   unsubscribe(remove subscription) in order to prevent Memory Leak
    this.authListenerSubscription.unsubscribe();
  }

  onDeletePost(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    },() => {     // error case
      this.isLoading = false;
    });
  }

  onPageChanged(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;  // here index starts at 0, but on backend we are considering that we start with 1. Hence + 1 is added here.
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

}
