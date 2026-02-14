import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});
  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  List<dynamic> _complaints = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchComplaints();
  }

  Future<void> _fetchComplaints() async {
    try {
      final c = await ApiService.getAllComplaints();
      if (mounted) setState(() { _complaints = c; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resolve(int id) async {
    try {
      await ApiService.updateStatus(id: id, status: 'resolved');
      _snack('Status updated to resolved!');
      _fetchComplaints();
    } catch (_) { _snack('Failed to update', err: true); }
  }

  Future<void> _logout() async {
    await ApiService.logout();
    if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  void _snack(String m, {bool err = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(m), backgroundColor: err ? AppTheme.danger : AppTheme.success,
      behavior: SnackBarBehavior.floating, margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: SafeArea(child: Column(children: [
          // App Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Row(children: [
              Expanded(child: ShaderMask(
                shaderCallback: (b) => const LinearGradient(colors: [Colors.white, Color(0xFFA5B4FC)]).createShader(b),
                child: const Text('Admin Panel', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
              )),
              Container(
                decoration: BoxDecoration(gradient: AppTheme.dangerGradient, borderRadius: BorderRadius.circular(50)),
                child: Material(color: Colors.transparent, child: InkWell(
                  borderRadius: BorderRadius.circular(50), onTap: _logout,
                  child: const Padding(padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    child: Text('Logout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13))),
                )),
              ),
            ]),
          ),

          // Stats Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(children: [
              _statCard('Total', _complaints.length, Icons.list_alt_rounded, AppTheme.primaryPurple),
              const SizedBox(width: 12),
              _statCard('Pending', _complaints.where((c) => c['status'] == 'pending').length, Icons.pending_actions_rounded, AppTheme.warning),
              const SizedBox(width: 12),
              _statCard('Resolved', _complaints.where((c) => c['status'] == 'resolved').length, Icons.check_circle_outline, AppTheme.success),
            ]),
          ),
          const SizedBox(height: 16),

          // Complaints List
          Expanded(child: RefreshIndicator(
            onRefresh: _fetchComplaints, color: AppTheme.primaryPurple,
            child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryPurple))
              : _complaints.isEmpty
                ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.inbox_rounded, size: 48, color: Colors.white.withValues(alpha: 0.2)),
                    const SizedBox(height: 12),
                    const Text('No complaints', style: TextStyle(color: AppTheme.textMuted)),
                  ]))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _complaints.length,
                    itemBuilder: (_, i) => _complaintCard(_complaints[i]),
                  ),
          )),
        ])),
      ),
    );
  }

  Widget _statCard(String label, int count, IconData icon, Color color) {
    return Expanded(child: Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 8),
        Text('$count', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: color)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(color: color.withValues(alpha: 0.7), fontSize: 12, fontWeight: FontWeight.w500)),
      ]),
    ));
  }

  Widget _complaintCard(dynamic c) {
    final id = c['complaint_id'] as int;
    final status = c['status'] ?? 'pending';
    final fb = c['feedback'];
    final isPending = status == 'pending';

    return Container(
      margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0x0DFFFFFF), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0x1AFFFFFF))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Text(c['title']??'', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textWhite))),
          AppTheme.statusBadge(status),
        ]),
        const SizedBox(height: 8),
        Text('#$id', style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 12)),
        const SizedBox(height: 8),

        // Feedback
        if (fb != null) Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: const Color(0x1A34D399), borderRadius: BorderRadius.circular(8)),
          child: Row(children: [
            const Icon(Icons.feedback_rounded, size: 14, color: AppTheme.success),
            const SizedBox(width: 6),
            Expanded(child: Text(fb, style: const TextStyle(color: AppTheme.success, fontSize: 13))),
          ]),
        )
        else const Text('No feedback yet', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),

        // Resolve Button
        if (isPending) ...[
          const SizedBox(height: 12),
          AppTheme.gradientButton(
            label: 'Resolve',
            onPressed: () => _resolve(id),
            gradient: AppTheme.successGradient,
          ),
        ],
      ]),
    );
  }
}
