'use client'

import { cn } from '@/lib/utils'

// Main Loading Spinner Component
export function LoadingSpinner({ 
  size = "default", 
  variant = "default",
  className = "",
  showText = true,
  text = "Loading...",
  fullScreen = false,
  icon: Icon = null 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  const iconSizeClasses = {
    sm: "h-2 w-2",
    default: "h-4 w-4", 
    lg: "h-6 w-6",
    xl: "h-8 w-8"
  }

  const variantClasses = {
    default: "border-blue-600 dark:border-blue-500",
    primary: "border-blue-600 dark:border-blue-500",
    secondary: "border-slate-600 dark:border-slate-400",
    success: "border-green-600 dark:border-green-500",
    warning: "border-amber-600 dark:border-amber-500",
    danger: "border-red-600 dark:border-red-500"
  }

  const iconColorClasses = {
    default: "text-blue-600 dark:text-blue-400",
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-slate-600 dark:text-slate-300",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400"
  }

  const spinnerElement = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Modern rotating spinner */}
      <div className="relative flex items-center justify-center">
        <div 
          className={cn(
            "animate-spin rounded-full border-2 border-transparent",
            "border-t-current border-r-current",
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
        />
        {/* Icon inside the spinner - perfectly centered */}
        {Icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon 
              className={cn(
                "opacity-80",
                iconSizeClasses[size],
                iconColorClasses[variant]
              )}
            />
          </div>
        )}
      </div>
      
      {showText && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinnerElement}
      </div>
    )
  }

  return spinnerElement
}

// Page Loading Component (for full page loads)
export function PageLoading({ 
  title = "Loading...",
  subtitle = "Please wait while we prepare your content",
  variant = "default",
  icon = null 
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <LoadingSpinner 
          size="xl" 
          variant={variant}
          showText={false}
          icon={icon}
          className="mx-auto mb-6"
        />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

// Content Loading Component (for loading within a page container)
export function ContentLoading({ 
  title = "Loading...",
  subtitle = "Please wait while we prepare your content",
  variant = "default",
  icon = null 
}) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center max-w-md mx-auto px-4">
        <LoadingSpinner 
          size="xl" 
          variant={variant}
          showText={false}
          icon={icon}
          className="mx-auto mb-6"
        />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

// Card Loading Component (for content sections)
export function CardLoading({ 
  className = "",
  lines = 3,
  showAvatar = false 
}) {
  return (
    <div className={cn(
      "animate-pulse bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg p-6",
      className
    )}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="h-12 w-12 bg-gray-300 dark:bg-slate-700 rounded-full" />
        )}
        <div className="flex-1 space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-slate-700 rounded",
                i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"
              )} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Table Loading Component
export function TableLoading({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-3/4" />
            ))}
          </div>
        </div>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className={cn(
                    "h-4 bg-gray-300 dark:bg-slate-700 rounded",
                    colIndex === 0 ? "w-full" : "w-2/3"
                  )} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Button Loading Component
export function ButtonLoading({ 
  children, 
  isLoading = false, 
  className = "",
  spinnerSize = "sm",
  ...props 
}) {
  return (
    <button 
      className={cn("relative", className)} 
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner 
            size={spinnerSize} 
            showText={false}
            className="text-current"
          />
        </div>
      )}
      <span className={cn(isLoading && "opacity-0")}>
        {children}
      </span>
    </button>
  )
}

// Inline Loading Component (for small sections)
export function InlineLoading({ 
  text = "Loading...",
  size = "sm",
  className = "" 
}) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoadingSpinner 
        size={size} 
        showText={false}
        className="text-blue-600 dark:text-blue-400"
      />
      <span className="text-sm text-gray-600 dark:text-slate-400">
        {text}
      </span>
    </div>
  )
}

export default LoadingSpinner
