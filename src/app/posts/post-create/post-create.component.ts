import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { PostService } from '../post.service';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {

  enteredTitle = "";
  enteredContent = "";
  post: Post;
  isLoading = false;
  pForm: FormGroup;
  imagePreview: string;
  private mode = "create";
  private postId: string;
  private authListenerSubscription: Subscription

  constructor(public postService: PostService, public route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.authListenerSubscription = this.authService.getAuthStatusListener().subscribe((isAuthenticated) =>{
      this.isLoading = false;
    });
    this.pForm = new FormGroup({
      'pTitle': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'pContent': new FormControl(null, { validators: [Validators.required] }),
      'pImage': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]   // mimeType validator function created separately in other file is called here
      })
    });

    // code to check url if in create or edit mode
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has("postId")) {    // The name postId comes from the url 'edit/:postId' as defined in app-routing.module.ts
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = { id: postData._id, title:postData.title, content:postData.content, imagePath: postData.imagePath, userId: postData.userId };
          this.pForm.setValue({
            'pTitle': this.post.title,
            'pContent': this.post.content,
            'pImage': this.post.imagePath   // even though imagePath is a string value, we can still assign it to the input. We're not limited to assigning a file here.
          });
        });
      }
      else
      {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  onSavePost() {
    if(this.pForm.invalid) {
      return;
    }
    this.isLoading = true;    // don't need to set it to false, because we are navigating away from this page. And if we come back to, it is set to true on top.
    if(this.mode === "create") {
      this.postService.createPost(this.pForm.value.pTitle, this.pForm.value.pContent, this.pForm.value.pImage);
    }
    else {
      this.postService.updatePost(this.postId, this.pForm.value.pTitle, this.pForm.value.pContent, this.pForm.value.pImage);
    }
    this.pForm.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.pForm.patchValue({ pImage: file });
    this.pForm.get('pImage').updateValueAndValidity();  // runs the validator on the image input, even though the user didnt ineract with it directly
    const reader = new FileReader();
    reader.onload = () => {   // onload event of FileReader used as a function. It is an Async function(callback function is used bcoz it takes a while). The code within the function executes once its done reading the file
      this.imagePreview = reader.result as string;  // result will contain the url of the image
    }
    reader.readAsDataURL(file);   // to load the file. This begins the process which leads to the above event being fired.
  }

  ngOnDestroy() {
    this.authListenerSubscription.unsubscribe();
  }
}
