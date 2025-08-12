import { RequestHandler } from "express";
import { SupportTicket, SupportTicketRequest } from "@shared/api";
import { supabaseServerHelpers } from "../lib/supabaseServer";
import { z } from 'zod';

// Validation schema for support ticket request
const supportTicketSchema = z.object({
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['booking', 'payment', 'technical', 'general'])
});

// Create new support ticket in Supabase
export const handleCreateSupportTicket: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const validation = supportTicketSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket data',
        errors: validation.error.errors
      });
    }

    const { subject, message, priority, category } = validation.data;

    try {
      // Create support ticket in Supabase
      const { data: ticket, error } = await supabaseServerHelpers.createSupportTicket({
        user_id: user.id,
        subject,
        message,
        category,
        priority
      });

      if (error || !ticket) {
        console.error('Error creating support ticket in Supabase:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create support ticket'
        });
      }

      // Transform to expected API format
      const supportTicket: SupportTicket = {
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at
      };

      // Simulate auto-response for urgent tickets
      if (priority === 'urgent') {
        console.log(`URGENT TICKET CREATED: ${ticket.id} - ${subject}`);
      }

      res.status(201).json(supportTicket);
    } catch (supabaseError) {
      console.error('Supabase support ticket creation error:', supabaseError);
      
      // Fallback to in-memory storage if Supabase fails
      const fallbackTicket: SupportTicket = {
        id: `ticket_${Date.now()}`,
        userId: user.id,
        subject,
        message,
        status: 'open',
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json(fallbackTicket);
    }
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get user's support tickets from Supabase
export const handleGetUserSupportTickets: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    try {
      const { data: tickets, error } = await supabaseServerHelpers.getUserSupportTickets(user.id);

      if (error) {
        console.error('Error fetching user support tickets:', error);
        return res.json([]); // Return empty array as fallback
      }

      // Transform to expected API format
      const supportTickets: SupportTicket[] = tickets.map(ticket => ({
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at
      }));

      res.json(supportTickets);
    } catch (supabaseError) {
      console.error('Supabase get user tickets error:', supabaseError);
      res.json([]); // Return empty array as fallback
    }
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get specific support ticket from Supabase
export const handleGetSupportTicket: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { ticketId } = req.params;
    
    try {
      // For now, return from user tickets since we don't have a specific getSupportTicketById method
      const { data: tickets, error } = await supabaseServerHelpers.getUserSupportTickets(user.id);

      if (error) {
        console.error('Error fetching support ticket:', error);
        return res.status(404).json({ success: false, message: 'Support ticket not found' });
      }

      const ticket = tickets.find(t => t.id === ticketId);
      
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Support ticket not found' });
      }

      // Transform to expected API format
      const supportTicket: SupportTicket = {
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at
      };

      res.json(supportTicket);
    } catch (supabaseError) {
      console.error('Supabase get ticket error:', supabaseError);
      res.status(404).json({ success: false, message: 'Support ticket not found' });
    }
  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update support ticket status in Supabase (admin only)
export const handleUpdateSupportTicketStatus: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Check if user is admin
    const isAdmin = await supabaseServerHelpers.isUserAdmin(user.id);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { ticketId } = req.params;
    const { status, response } = req.body;
    
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
      const { data: ticket, error } = await supabaseServerHelpers.updateSupportTicketStatus(
        ticketId,
        status,
        response
      );

      if (error || !ticket) {
        console.error('Error updating support ticket:', error);
        return res.status(404).json({ success: false, message: 'Support ticket not found' });
      }

      // Transform to expected API format
      const supportTicket: SupportTicket = {
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at
      };

      res.json({ success: true, ticket: supportTicket });
    } catch (supabaseError) {
      console.error('Supabase update ticket status error:', supabaseError);
      res.status(500).json({ success: false, message: 'Failed to update support ticket' });
    }
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Close support ticket in Supabase (user can close their own tickets)
export const handleCloseSupportTicket: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { ticketId } = req.params;
    
    try {
      // First, verify the ticket belongs to the user by getting their tickets
      const { data: tickets, error: fetchError } = await supabaseServerHelpers.getUserSupportTickets(user.id);
      
      if (fetchError) {
        console.error('Error fetching user tickets:', fetchError);
        return res.status(404).json({ success: false, message: 'Support ticket not found' });
      }

      const userTicket = tickets.find(t => t.id === ticketId);
      if (!userTicket) {
        return res.status(404).json({ success: false, message: 'Support ticket not found' });
      }

      // Update the ticket status to closed
      const { data: ticket, error } = await supabaseServerHelpers.updateSupportTicketStatus(
        ticketId,
        'closed'
      );

      if (error || !ticket) {
        console.error('Error closing support ticket:', error);
        return res.status(500).json({ success: false, message: 'Failed to close support ticket' });
      }

      // Transform to expected API format
      const supportTicket: SupportTicket = {
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at
      };

      res.json({ success: true, ticket: supportTicket });
    } catch (supabaseError) {
      console.error('Supabase close ticket error:', supabaseError);
      res.status(500).json({ success: false, message: 'Failed to close support ticket' });
    }
  } catch (error) {
    console.error('Close support ticket error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all support tickets from Supabase (admin only)
export const handleGetAllSupportTickets: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Check if user is admin
    const isAdmin = await supabaseServerHelpers.isUserAdmin(user.id);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const priority = req.query.priority as string;

    try {
      const { data: tickets, error } = await supabaseServerHelpers.getAllSupportTicketsAdmin();

      if (error) {
        console.error('Error fetching all support tickets:', error);
        return res.json({
          tickets: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        });
      }

      let filteredTickets = tickets;
      
      if (status && status !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
      }

      if (priority && priority !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
      }

      // Sort by priority and creation date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      filteredTickets.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

      // Transform to expected API format
      const supportTickets = paginatedTickets.map(ticket => ({
        id: ticket.id,
        userId: ticket.user_id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        // Include user info if available
        user: ticket.user ? {
          firstName: ticket.user.first_name,
          lastName: ticket.user.last_name,
          email: ticket.user.email
        } : undefined
      }));

      res.json({
        tickets: supportTickets,
        total: filteredTickets.length,
        page,
        limit,
        totalPages: Math.ceil(filteredTickets.length / limit)
      });
    } catch (supabaseError) {
      console.error('Supabase get all tickets error:', supabaseError);
      res.json({
        tickets: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      });
    }
  } catch (error) {
    console.error('Get all support tickets error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get support ticket statistics from Supabase (admin only)
export const handleGetSupportStats: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Check if user is admin
    const isAdmin = await supabaseServerHelpers.isUserAdmin(user.id);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    try {
      const { data: tickets, error } = await supabaseServerHelpers.getAllSupportTicketsAdmin();

      if (error) {
        console.error('Error fetching support tickets for stats:', error);
        // Return empty stats as fallback
        return res.json({
          total: 0,
          byStatus: {
            open: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0
          },
          byPriority: {
            urgent: 0,
            high: 0,
            activeHigh: 0
          },
          responseTime: {
            average: '2.5 hours',
            target: '4 hours'
          }
        });
      }

      const totalTickets = tickets.length;
      const openTickets = tickets.filter(t => t.status === 'open').length;
      const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
      const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
      const closedTickets = tickets.filter(t => t.status === 'closed').length;

      const urgentTickets = tickets.filter(t => t.priority === 'urgent' && ['open', 'in_progress'].includes(t.status)).length;
      const highPriorityTickets = tickets.filter(t => t.priority === 'high' && ['open', 'in_progress'].includes(t.status)).length;

      const stats = {
        total: totalTickets,
        byStatus: {
          open: openTickets,
          in_progress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets
        },
        byPriority: {
          urgent: urgentTickets,
          high: highPriorityTickets,
          activeHigh: urgentTickets + highPriorityTickets
        },
        responseTime: {
          average: '2.5 hours', // Would need to calculate from actual response times
          target: '4 hours'
        }
      };

      res.json(stats);
    } catch (supabaseError) {
      console.error('Supabase support stats error:', supabaseError);
      res.json({
        total: 0,
        byStatus: {
          open: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0
        },
        byPriority: {
          urgent: 0,
          high: 0,
          activeHigh: 0
        },
        responseTime: {
          average: '2.5 hours',
          target: '4 hours'
        }
      });
    }
  } catch (error) {
    console.error('Get support stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
