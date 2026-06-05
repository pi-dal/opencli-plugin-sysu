---
name: opencli-sysu
description: Use when the user needs to query school courses, class schedules, empty classrooms, grades, library catalogs, and Moodle LMS course activities/resources for Sun Yat-sen University (SYSU).
---

# opencli-sysu

## Overview

Sun Yat-sen University (SYSU) educational services and portal access skill built on top of the `opencli-plugin-sysu` adapter.

This skill spans multiple SYSU systems:
1. **JWXT (教务系统)**: Classroom searches, course schedules, grades, and training plans. Requires a logged-in JWXT browser session.
2. **Library (图书馆)**: Library catalog searches, database links, and book status checks. Public access, no login required.
3. **LMS (中山大学东校区/南校区等课程平台 - Moodle)**: Course activities, resources, and dashboards. Requires a logged-in Moodle LMS browser session.

## Use when

- The user wants to search for empty classrooms or classroom schedule details at SYSU
- The user needs to retrieve their class timetable, training plan, or course grades from JWXT
- The user wants to check JWXT notifications and teaching announcements
- The user wants to search for books or databases in the SYSU Library catalog, or check a specific book item's loan status
- The user wants to pull active course tasks, assignments, and uploaded files from the SYSU Moodle LMS

## Commands Reference

### JWXT (教务系统) Operations

- Find empty classrooms:
  ```bash
  opencli sysu jwxt-classrooms --campus <campus> [--building <building>] [--week <week>] [--day <day>]
  ```
  *Example*: `opencli sysu jwxt-classrooms --campus 东校园 --building 教学楼`

- View classroom schedule details:
  ```bash
  opencli sysu jwxt-classroom-schedule-detail --room <room> [--week <week>]
  ```
  *Example*: `opencli sysu jwxt-classroom-schedule-detail --room "教学楼B201"`

- View class timetable:
  ```bash
  opencli sysu jwxt-timetable [--semester <semester>]
  ```

- View course grades:
  ```bash
  opencli sysu jwxt-grades [--semester <semester>]
  ```

- View courses & training plans:
  ```bash
  opencli sysu jwxt-courses
  opencli sysu jwxt-training-plan
  opencli sysu jwxt-notifications
  ```

### Library Operations

- Search library books:
  ```bash
  opencli sysu library-catalog <query> [--limit <limit>]
  ```
  *Example*: `opencli sysu library-catalog "algorithm design" --limit 5`

- View specific book status and locations:
  ```bash
  opencli sysu library-item <record-id>
  ```
  *Example*: `opencli sysu library-item 123456`

- List library databases:
  ```bash
  opencli sysu library-databases [query]
  ```

### Moodle LMS Operations

- View dashboard (active courses and deadlines):
  ```bash
  opencli sysu lms-dashboard
  ```

- List course assignments and activities:
  ```bash
  opencli sysu lms-activity <course-id>
  ```

- List course files and folders:
  ```bash
  opencli sysu lms-resource <course-id>
  ```

- Show details of a course:
  ```bash
  opencli sysu lms-course <course-id>
  ```

## Best practices & limitations

- **Login / Session state**: Ensure you have logged into the respective system (JWXT or Moodle LMS) in your Chrome browser before running the jwxt/lms commands. Library catalog commands do not require authentication.
- **Campus and Building names**: When querying classrooms, use official Chinese names for campuses (e.g. `南校园`, `北校园`, `东校园`, `珠海校区`, `深圳校区`).
