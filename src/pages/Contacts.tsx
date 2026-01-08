import { useState } from "react";
import { Search, Plus } from "lucide-react";
import Header from "@/components/Header";
import ContactCard from "@/components/ContactCard";
import ContactDetailsDialog from "@/components/ContactDetailsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

// Mock data for demonstration
const mockContacts = [
  {
    id: "1",
    name: "Sarah Chen",
    company: "TechVentures Inc",
    email: "sarah.chen@techventures.io",
    lastInteraction: "2025-01-08",
    relationshipHealth: 85,
    sentiment: "Positive",
    conversationSummary: "Discussed potential partnership for Q2. Sarah expressed strong interest in our platform and wants to schedule a demo for her team.",
    actionItems: [
      "Send product demo link",
      "Schedule team presentation",
      "Prepare pricing proposal"
    ],
    nextFollowUp: "2025-01-15",
    suggestedReply: "Hi Sarah, following up on our conversation about the Q2 partnership. I've prepared a demo link and some initial pricing options for your team. Would next Tuesday work for a team presentation?"
  },
  {
    id: "2",
    name: "Marcus Johnson",
    company: "Global Solutions LLC",
    email: "marcus.j@globalsolutions.com",
    lastInteraction: "2025-01-06",
    relationshipHealth: 92,
    sentiment: "Very Positive",
    conversationSummary: "Long-time client checking in about annual renewal. Very satisfied with our service and considering expanding to additional departments.",
    actionItems: [
      "Send renewal contract",
      "Discuss expansion options",
      "Introduce to account manager"
    ],
    nextFollowUp: "2025-01-12",
    suggestedReply: "Hi Marcus, great to hear from you! I'm thrilled you're considering expanding. Let me connect you with our enterprise team to discuss the best options for your additional departments."
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    company: "StartupXYZ",
    email: "emily@startupxyz.com",
    lastInteraction: "2024-12-28",
    relationshipHealth: 45,
    sentiment: "Neutral",
    conversationSummary: "Initial outreach. Emily seemed interested but mentioned budget constraints. Suggested following up in Q1.",
    actionItems: [
      "Check Q1 budget status",
      "Send case studies",
      "Offer startup discount"
    ],
    nextFollowUp: "2025-01-20",
    suggestedReply: "Hi Emily, hope you had a great start to the new year! I wanted to follow up on our conversation about budget. We have a new startup program that might work better for your current stage."
  },
  {
    id: "4",
    name: "David Park",
    company: "Innovation Labs",
    email: "d.park@innovationlabs.io",
    lastInteraction: "2025-01-09",
    relationshipHealth: 78,
    sentiment: "Positive",
    conversationSummary: "Technical discussion about API integration. David's team is evaluating our platform for their new project launching in March.",
    actionItems: [
      "Share API documentation",
      "Schedule technical demo",
      "Provide sandbox access"
    ],
    nextFollowUp: "2025-01-13",
    suggestedReply: "Hi David, I've set up a sandbox environment for your team to test our API. The documentation link is attached. Let me know if you need any technical support during evaluation."
  },
  {
    id: "5",
    name: "Lisa Thompson",
    company: "Enterprise Corp",
    email: "l.thompson@enterprisecorp.com",
    lastInteraction: "2024-12-20",
    relationshipHealth: 60,
    sentiment: "Neutral",
    conversationSummary: "Met at conference. Lisa expressed interest in learning more but hasn't responded to follow-up emails.",
    actionItems: [
      "Try different communication channel",
      "Send value-focused content",
      "Connect on LinkedIn"
    ],
    nextFollowUp: "2025-01-18",
    suggestedReply: "Hi Lisa, it was great meeting you at the conference! I know the holidays were busy. I wanted to share a quick case study that's relevant to the challenges you mentioned. Would love to hear your thoughts."
  },
  {
    id: "6",
    name: "James Wilson",
    company: "Digital Dynamics",
    email: "james.w@digitaldynamics.net",
    lastInteraction: "2025-01-07",
    relationshipHealth: 95,
    sentiment: "Very Positive",
    conversationSummary: "Referred two new clients this month. James is a strong advocate and active user. Sent thank you gift.",
    actionItems: [
      "Follow up on referrals",
      "Invite to advisory board",
      "Feature in case study"
    ],
    nextFollowUp: "2025-01-16",
    suggestedReply: "Hi James, I can't thank you enough for the recent referrals! Your advocacy means the world to us. I'd love to discuss an opportunity to join our customer advisory board - your insights would be invaluable."
  }
];

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | null>(null);

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">Contacts</h1>
          <p className="text-muted-foreground text-lg">
            Manage your relationships and track interactions
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-scale-in">
          <div className="relative ios-glass-card p-4">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search contacts by name, company, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
            />
          </div>
        </div>

        {/* Contact Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {filteredContacts.map((contact, index) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => setSelectedContact(contact)}
              animationDelay={index * 50}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredContacts.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-muted-foreground text-lg">No contacts found matching your search.</p>
          </div>
        )}

        {/* Floating Add Contact Button */}
        <Button
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl ios-glass-button hover:scale-110 transition-all duration-300 animate-pulse"
          size="icon"
        >
          <Plus size={24} />
        </Button>
      </main>

      {/* Contact Details Dialog */}
      <ContactDetailsDialog
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      />

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Contacts;
