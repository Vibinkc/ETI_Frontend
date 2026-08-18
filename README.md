# ETI Frontend - ByeWind Dashboard

A modern, production-ready dashboard built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Project Structure

```
eti_frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/            # Layout components
│   │   ├── Sidebar.tsx    # Left navigation sidebar
│   │   ├── Header.tsx     # Top header bar
│   │   └── RightSidebar.tsx # Right sidebar (notifications, activities, contacts)
│   └── dashboard/         # Dashboard-specific components
│       ├── OverviewCards.tsx          # Overview metric cards
│       ├── UserActivityChart.tsx      # User activity line chart
│       ├── TrafficByDeviceChart.tsx   # Traffic by device bar chart
│       ├── TrafficByLocationChart.tsx # Traffic by location donut chart
│       └── TrafficByWebsiteList.tsx  # Traffic by website list
├── public/                # Static assets
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── next.config.ts        # Next.js configuration
└── postcss.config.mjs    # PostCSS configuration
```

## Features

- **Modern UI**: Clean, professional dashboard design matching the ByeWind brand
- **Responsive Layout**: Three-column layout with sidebar navigation, main content, and activity sidebar
- **Interactive Charts**: Built with Recharts for data visualization
  - Line charts for user activity trends
  - Bar charts for device traffic
  - Donut charts for location distribution
- **Real-time Metrics**: Overview cards with trend indicators
- **Activity Feed**: Notifications, activities, and contacts sidebar

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
npm run build
npm start
```

## Dependencies

### Core
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety

### Styling
- **Tailwind CSS 4**: Utility-first CSS framework
- **PostCSS**: CSS processing

### UI Components
- **Recharts**: Chart library for data visualization
- **Lucide React**: Icon library

## Component Architecture

### Layout Components
- **Sidebar**: Navigation menu with categories (Dashboards, Pages, Account, etc.)
- **Header**: Top bar with breadcrumbs, search, and action icons
- **RightSidebar**: Activity feed with notifications, activities, and contacts

### Dashboard Components
- **OverviewCards**: Four metric cards showing Views, Visits, New Users, and Active Users
- **UserActivityChart**: Line chart comparing this year vs last year
- **TrafficByDeviceChart**: Bar chart showing traffic by device type
- **TrafficByLocationChart**: Donut chart showing traffic by location
- **TrafficByWebsiteList**: List view with progress bars for website traffic

## Production Considerations

- All components are properly typed with TypeScript
- Client components are marked with "use client" directive
- Responsive design for various screen sizes
- Clean folder structure for maintainability
- No linting errors
- Optimized imports and code splitting

## Customization

To customize the dashboard:
1. Update data in component files (charts, lists, etc.)
2. Modify styles in Tailwind classes
3. Add new components in the `components/` directory
4. Extend navigation in `Sidebar.tsx`
