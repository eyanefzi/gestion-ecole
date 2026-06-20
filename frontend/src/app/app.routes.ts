import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { LoginComponent } from './components/login.component';
import { LayoutComponent } from './components/layout.component';
import { DashboardComponent } from './components/dashboard.component';
import { CoursesComponent } from './components/courses.component';
import { StudentsComponent } from './components/students.component';
import { EnrollmentsComponent } from './components/enrollments.component';

import { QuizMainComponent } from './components/quiz-main.component';
import { UsersComponent } from './components/users.component';
import { MyCoursesComponent } from './components/my-courses.component';

import { TakeQuizComponent } from './components/take-quiz.component';
import { UsersApprovalComponent } from './components/users-approval.component';
import { MyQuizHistoryComponent } from './components/my-quiz-history.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'my-courses', component: MyCoursesComponent },

      { path: 'my-quiz-history', component: MyQuizHistoryComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'users-approval', component: UsersApprovalComponent },
      { path: 'enrollments', component: EnrollmentsComponent },

      { path: 'quiz', component: QuizMainComponent },
      { path: 'quiz/take/:id', component: TakeQuizComponent },
      { path: 'users', component: UsersComponent }
    ]
  },
  { path: '**', redirectTo: '/' }
];
