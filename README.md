# Kalinga_Warriors

Build a modern, premium, responsive cricket team website and management platform for our cricket team. The website should feel energetic, professional and sporty rather than like a generic template.

1. Overall Design

Create a visually impressive cricket-themed website with:

Team logo prominently displayed throughout the website.

The team logo used subtly as a large background watermark on selected sections.

Dark/athletic visual theme with strong cricket-inspired typography and animations.

Fully responsive design for mobile, tablet and desktop.

Smooth animations and hover effects, but avoid excessive animations.

Modern cards, glassmorphism where appropriate, rounded corners and clean spacing.

Use placeholder team name, logo and player information initially so they can easily be replaced later.

Add a professional hero section with:

Team logo

Team name

Short tagline

"Challenge Us" CTA

"View Schedule" CTA

"Book Ground" CTA

The website should feel like an actual local cricket club/team portal, not just a landing page.

2. Homepage

Create a strong homepage containing:

Hero Section

Team logo in the background.

Team name and tagline.

Short introduction about the team.

Buttons:

Challenge Us

View Schedule

Book Ground

Quick Stats

Display attractive statistic cards such as:

Matches Played

Wins

Losses

Win %

Upcoming Matches

These statistics should be editable from the admin panel.

Next Match

Display the upcoming scheduled match prominently:

Opponent

Date

Time

Venue

Match status

Countdown timer

Recent Results

Show the latest matches:

Opponent

Date

Venue

Result

Score if available

Win/Loss indicator

Team Introduction

A short "About Us" section with team logo/background watermark.

3. Players Section

Create a dedicated Our Players page.

Each player should have a beautiful player card containing:

Player photo

Name

Jersey number

Playing role

Batting style

Bowling style

Short bio

Optional statistics

Example roles:

Captain

Vice Captain

Batsman

Bowler

All-rounder

Wicketkeeper

Player cards should support filtering by role.

Admin should be able to:

Add player

Edit player

Delete player

Upload/change player photo

Change jersey number

Change role

Add/edit player statistics

Reorder players

4. Challenge Us — Match Request System

Create a dedicated Challenge Us form where another cricket team can request a match.

Required fields:

Opposite Cricket Team Name

Contact Person Name

Phone Number

Email Address

Preferred Match Date

Preferred Match Time

Proposed Venue

Optional Message

The user should also be able to select:

Match format:

T10

T20

T25

T30

Other

Ball type:

Tennis Ball

Hard Tennis Ball

Important workflow

When someone submits a challenge:

Pending → Admin Review → Accepted / Rejected / Reschedule Requested

Do NOT automatically confirm a match.

Show the user a confirmation message such as:

"Your challenge request has been received. Our team will review the request and contact you shortly."

The admin should receive the request in the dashboard.

Admin should be able to:

View requests

Accept

Reject

Request rescheduling

Add notes

Convert an accepted challenge into a scheduled match

Prevent duplicate bookings by checking the existing team schedule.

5. Cricket Calendar / Schedule

Create a dedicated Schedule & Calendar page.

Display matches in:

Monthly calendar

Weekly view

List view

Each scheduled match should show:

Date

Time

Opponent

Venue

Match type

Status

Result

Use different visual indicators for:

Upcoming

Completed

Cancelled

Pending

Clicking a match should open a detailed match modal/page.

Admin Schedule Management

Admin must be able to:

Add match

Edit match

Delete match

Reschedule match

Mark match as completed

Enter final score

Enter result

Add match notes

Change venue

Change opponent

When an admin adds or edits a match, the calendar should update immediately.

6. Ground Booking System

Since we also offer cricket ground booking, create a complete Book Our Ground section.

Display:

Ground photos

Ground name

Location

Available facilities

Pitch type

Ball type supported

Match capacity

Available time slots

Price per match

The price must be displayed in Indian Rupees (₹).

Example:

₹2,500 / Match

Do NOT hardcode the price.

The admin must be able to change the price at any time.

Ground Booking Form

Fields:

Customer/Team Name

Contact Person

Phone Number

Email

Booking Date

Preferred Time Slot

Match Duration

Number of players

Match format

Additional requirements

Show available and unavailable slots.

Booking flow:

Available → Booking Request → Admin Confirmation → Confirmed

Do not allow two customers to book the same ground/time slot.

7. Ground Booking Calendar

Create a visual availability calendar.

Users should be able to select a date and see:

Available slots

Booked slots

Pending slots

Closed/unavailable slots

Use clear visual indicators.

Admin should be able to:

Block a date

Block a particular time slot

Open a previously blocked slot

Confirm booking

Reject booking

Cancel booking

Reschedule booking

8. Pricing Management

Create an admin-only Pricing Management section.

Admin should be able to configure:

Price per match

Different prices for different time slots

Weekday price

Weekend price

Optional additional charges

Show prices using Indian formatting:

₹2,500

Do not assume USD or any other currency.

Whenever the admin changes the price, new bookings should use the new price while existing confirmed bookings should retain their original agreed price.

This is important to prevent historical bookings from changing when the price changes.

9. Admin Dashboard

Create a secure admin dashboard.

Dashboard overview should contain:

Statistics

Total Players

Upcoming Matches

Pending Challenges

Ground Booking Requests

Confirmed Ground Bookings

Revenue from Ground Bookings

Admin Sections

Team Management

Players

Team information

Logo

Team statistics

Match Management

Schedule

Results

Challenge requests

Ground Management

Ground details

Availability

Bookings

Pricing

Content Management

Homepage content

Gallery

Announcements

10. Notifications

Build a notification system.

For example:

Challenge Request

"New match challenge received from ABC Cricket Club."

Ground Booking

"New ground booking request received for 24 August."

Admin Confirmation

"Your cricket match challenge has been accepted."

Reschedule

"Your requested match has been proposed for a new date."

If email integration is not configured initially, build the notification system so email/SMS/WhatsApp integration can be added later.

11. Gallery

Add a Gallery page.

Admin can upload:

Match photos

Team photos

Trophy photos

Ground photos

Training photos

Include categories and a responsive image gallery.

12. Match Results

Create a Results page.

Each match should contain:

Opponent

Date

Venue

Match format

Our score

Opponent score

Result

Player of the Match

Match summary

Allow admin to enter and edit these details.

13. Contact / Location

Create a contact section containing:

Team contact number

Email

Ground location

Google Maps integration placeholder

Social media links

Add a floating WhatsApp/contact button if appropriate.

14. Important Backend/Data Requirements

Do not build this as a static website.

Use a proper database/backend so that:

Players are stored dynamically.

Matches are stored dynamically.

Challenge requests are stored.

Ground bookings are stored.

Prices are stored.

Admin changes persist after refreshing the website.

Calendar data comes from the database.

Booking conflicts are prevented.

Create a clean database structure for:

Users/Admins

Players

Matches

Match Challenges

Grounds

Ground Availability

Ground Bookings

Pricing

Notifications

Gallery

Team Settings

15. Authentication & Security

Create an admin login.

Only authenticated admins should be able to:

Modify players

Modify schedule

Accept/reject challenges

Modify ground pricing

Manage bookings

Upload/delete gallery images

Public users should only be able to:

View information

Submit challenges

Request ground bookings

View availability

Contact the team

Validate all forms and prevent unauthorized admin access.

16. Important Edge Cases / Bottlenecks

Handle these properly:

Double Booking

Two users must not be able to book the same ground and time slot.

Match Conflict

The team's own match schedule should not allow another match to be scheduled at the same time.

Past Dates

Users should not be able to submit bookings for dates that have already passed.

Challenge Conflict

If another team challenges us for a date where we already have a match, show an appropriate warning.

Booking Cancellation

Maintain booking status instead of simply deleting records.

Use:

Pending → Confirmed → Completed / Cancelled

Price Changes

New pricing should apply to future bookings only. Existing confirmed bookings should preserve their original price.

Admin Mistakes

Ask for confirmation before:

Deleting a player

Deleting a match

Cancelling a confirmed booking

Changing important pricing

Mobile Users

Make forms extremely easy to use on mobile because most users will likely access the website through phones.

17. Search & Filtering

Add search/filter functionality for:

Players

Matches

Results

Ground bookings

Challenge requests

Admin should be able to filter bookings by:

Date

Status

Customer/team

Time slot

18. UI/UX Requirements

Use a professional sports dashboard style.

Suggested navigation:

Home | Team | Players | Schedule | Results | Challenge Us | Book Ground | Gallery | Contact

For admin:

Dashboard | Players | Matches | Challenges | Ground Bookings | Calendar | Pricing | Gallery | Settings

Use:

Responsive navigation

Sticky header

Attractive cards

Modern buttons

Loading states

Empty states

Success/error notifications

Confirmation dialogs

Form validation

Skeleton loaders where appropriate

Do not make the interface unnecessarily complicated.

19. Performance & Reliability

Make the website:

Fast loading

Mobile responsive

SEO friendly

Accessible

Optimized for images

Robust against invalid form submissions

Use lazy loading for player/gallery images.

Do not expose admin credentials or sensitive information in frontend code.

20. Future-Ready Architecture

Design the system so the following can be added later without rebuilding the application:

Online payment for ground booking

UPI payment integration

WhatsApp notifications

SMS notifications

Email notifications

Player statistics

Live match scoring

Leaderboards

Tournament management

Multiple cricket grounds

Multiple teams

Membership registration

Player registration

Sponsors section

For now, implement the core functionality properly rather than creating fake versions of future features.

21. Final Quality Requirement

Before considering the website complete, test these complete user journeys:

Journey 1 — Challenge

Visitor → Challenge Us → Fill form → Submit → Admin receives request → Admin accepts → Match appears on calendar.

Journey 2 — Ground Booking

Visitor → Book Ground → Select date → See available slots → Select slot → Submit booking → Admin confirms → Slot becomes unavailable.

Journey 3 — Price Change

Admin → Pricing → Change price → Save → New booking shows updated ₹ price → Existing confirmed bookings retain old price.

Journey 4 — Schedule

Admin → Add match → Match appears on calendar → User can view it → Admin edits/reschedules → Calendar updates.

Journey 5 — Player

Admin → Add player → Upload photo → Save → Player immediately appears on Players page.

Make sure all of these work with real persistent data, not mock/demo-only functionality.

Visual Goal

The final result should look like a professional cricket club's official website combined with a lightweight cricket management and ground-booking system.

Prioritize:

Beautiful UI + simple user experience + reliable booking/calendar logic + powerful admin panel.

Do not fill the website with unnecessary placeholder sections. Every feature should have a clear purpose and work properly.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cricket-club.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/90119fa7-c9ce-4895-b5a6-93299445ab31).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
