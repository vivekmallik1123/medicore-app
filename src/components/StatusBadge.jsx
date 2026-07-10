const STATUS_CONFIG = {
  // Patient queue
  Waiting:          { label: 'Waiting',      bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  InProgress:       { label: 'In Progress',  bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  Done:             { label: 'Done',         bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  // Doctor
  Available:        { label: 'Available',    bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  InConsult:        { label: 'In Consult',   bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  OnBreak:          { label: 'On Break',     bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  // Billing
  Paid:             { label: 'Paid',         bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  Pending:          { label: 'Pending',      bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  // Lab
  Ordered:          { label: 'Ordered',      bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
  SampleCollected:  { label: 'Sample Coll.', bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  Processing:       { label: 'Processing',   bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' },
  ReportReady:      { label: 'Report Ready', bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  // Medicine stock
  OK:               { label: 'OK',           bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  Low:              { label: 'Low Stock',    bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  Critical:         { label: 'Critical',     bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-400'    },
  // Beds
  Occupied:         { label: 'Occupied',     bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  Empty:            { label: 'Available',    bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  Cleaning:         { label: 'Cleaning',     bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  Maintenance:      { label: 'Maintenance',  bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
  // Staff
  Present:          { label: 'Present',      bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-400'  },
  Absent:           { label: 'Absent',       bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-400'    },
  // Priority
  Urgent:           { label: 'Urgent',       bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  Normal:           { label: 'Normal',       bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
}

const SIZE_CLASSES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${
        config.bg
      } ${config.text} ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  )
}
