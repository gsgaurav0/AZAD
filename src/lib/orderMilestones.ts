import { OrderStatus, OrderStatusStep } from '@/types';

export const ORDER_MILESTONES: OrderStatus[] = [
  'Placed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export function getLocationForStatus(
  status: OrderStatus,
  address?: { street?: string; city?: string }
): string {
  const city = address?.city || 'Regional Distribution Hub';
  const street = address?.street || 'Destination Address';

  switch (status) {
    case 'Placed':
      return 'Mewak Central Fulfillment Hub, New Delhi';
    case 'Packed':
      return 'Mewak Logistics & Inspection Center, Gurugram';
    case 'Shipped':
      return 'BlueDart Express Air Cargo Gateway, IGI Terminal, New Delhi';
    case 'Out for Delivery':
      return `${city} Local Courier Delivery Center`;
    case 'Delivered':
      return `${street}, ${city}`;
    case 'Cancelled':
      return 'Customer Care & Logistics Resolution Desk';
    case 'Return Requested':
      return `${city} Doorstep Verification Desk`;
    case 'Return Approved':
      return 'Mewak Reverse Logistics Depot, Gurugram';
    case 'Return Rejected':
      return 'Customer Care & Logistics Resolution Desk';
    case 'Refunded':
      return 'Banking Settlement Gateway / Razorpay';
    default:
      return 'In Transit to Regional Logistics Hub';
  }
}

export function getNoteForStatus(
  status: OrderStatus,
  address?: { street?: string; city?: string }
): string {
  const street = address?.street || 'customer address';

  switch (status) {
    case 'Placed':
      return 'Order confirmed and allocated for diagnostic hardware quality checks.';
    case 'Packed':
      return '18-point hardware acoustic audit passed. Sealed in tamper-evident security packaging.';
    case 'Shipped':
      return 'Dispatched via BlueDart Express Air cargo. In transit to destination logistics hub.';
    case 'Out for Delivery':
      return `Assigned to express delivery marshal for doorstep handover to ${street}.`;
    case 'Delivered':
      return 'Hardware successfully delivered and signed by patron.';
    case 'Cancelled':
      return 'Order cancelled. Refund initiated to source payment method.';
    case 'Return Requested':
      return 'Return/exchange requested by customer. Diagnostic review initiated.';
    case 'Return Approved':
      return 'Return approved. Doorstep reverse pickup scheduled.';
    case 'Return Rejected':
      return 'Return rejected after hardware inspection review.';
    case 'Refunded':
      return 'Refund processed and credited to source account.';
    default:
      return `Order status updated to ${status}.`;
  }
}

export function formatMilestoneDate(d: Date = new Date()): string {
  const dateStr = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr}, ${timeStr}`;
}

/**
 * Builds or updates the 5 canonical tracking steps cleanly.
 * Guarantees zero duplicate steps, proper completion flags, realistic timestamps,
 * and accurate hub locations.
 */
export function buildCleanMilestoneHistory(
  targetStatus: OrderStatus,
  address?: { street?: string; city?: string },
  customNote?: string,
  customLocation?: string,
  existingHistory: OrderStatusStep[] = []
): OrderStatusStep[] {
  const now = formatMilestoneDate();
  const targetIdx = ORDER_MILESTONES.indexOf(targetStatus);

  // If status is a non-standard terminal state (Cancelled, Return, Refund)
  if (targetIdx === -1) {
    const baseMilestones = ORDER_MILESTONES.map((m) => {
      const match = existingHistory.find((e) => e.status === m);
      return (
        match || {
          status: m,
          timestamp: 'Pending',
          location: getLocationForStatus(m, address),
          note: getNoteForStatus(m, address),
          completed: false,
        }
      );
    });

    const terminalStep: OrderStatusStep = {
      status: targetStatus,
      timestamp: now,
      location: customLocation || getLocationForStatus(targetStatus, address),
      note: customNote || getNoteForStatus(targetStatus, address),
      completed: true,
    };

    return [...baseMilestones.filter((m) => m.completed), terminalStep];
  }

  // Standard 5-milestone progression
  return ORDER_MILESTONES.map((milestone, idx) => {
    // Find previously completed timestamp if available
    const existing = existingHistory.find((e) => e.status === milestone);
    const wasAlreadyCompleted = existing?.completed && existing.timestamp && !existing.timestamp.startsWith('Pending');

    if (idx <= targetIdx) {
      // Completed step
      return {
        status: milestone,
        completed: true,
        timestamp: wasAlreadyCompleted ? existing.timestamp : now,
        location:
          milestone === targetStatus && customLocation
            ? customLocation
            : existing?.location || getLocationForStatus(milestone, address),
        note:
          milestone === targetStatus && customNote
            ? customNote
            : existing?.note || getNoteForStatus(milestone, address),
      };
    } else {
      // Future pending step
      const pendingTimestamps: Record<string, string> = {
        Packed: 'Pending verification',
        Shipped: 'Pending cargo transit',
        'Out for Delivery': 'Pending local dispatch',
        Delivered: 'Estimated 2-3 business days',
      };

      return {
        status: milestone,
        completed: false,
        timestamp: pendingTimestamps[milestone] || 'Pending',
        location: getLocationForStatus(milestone, address),
        note: getNoteForStatus(milestone, address),
      };
    }
  });
}
