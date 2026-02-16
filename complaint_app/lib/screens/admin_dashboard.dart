import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});
  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> with SingleTickerProviderStateMixin {
  List<dynamic> _complaints = [];
  bool _isLoading = true;
  String _userName = 'Admin';
  int _currentTab = 0;

  // Filters
  String _searchQuery = '';
  String _filterStatus = 'all';

  // Analytics
  Map<String, dynamic>? _analytics;
  bool _analyticsLoading = true;

  // Detail sheet
  dynamic _selectedComplaint;

  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      setState(() => _currentTab = _tabController.index);
      if (_tabController.index == 1 && _analytics == null) _fetchAnalytics();
    });
    _loadUser();
    _fetchComplaints();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadUser() async {
    final name = await ApiService.getUserName();
    if (mounted && name != null) setState(() => _userName = name);
  }

  Future<void> _fetchComplaints() async {
    try {
      final c = await ApiService.getAllComplaints();
      if (mounted) setState(() { _complaints = c; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchAnalytics() async {
    setState(() => _analyticsLoading = true);
    try {
      final data = await ApiService.getAnalytics();
      if (mounted) setState(() { _analytics = data; _analyticsLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _analyticsLoading = false);
    }
  }

  Future<void> _updateStatus(int id, String newStatus) async {
    try {
      await ApiService.updateStatus(id: id, status: newStatus);
      _snack('Status updated to ${newStatus.replaceAll('_', ' ')}');
      _fetchComplaints();
      if (_analytics != null) _fetchAnalytics();
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

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  List<dynamic> get _filteredComplaints {
    return _complaints.where((c) {
      final matchSearch = _searchQuery.isEmpty ||
          (c['title'] ?? '').toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (c['category'] ?? '').toLowerCase().contains(_searchQuery.toLowerCase()) ||
          c['complaint_id'].toString().contains(_searchQuery);
      final matchStatus = _filterStatus == 'all' || c['status'] == _filterStatus;
      return matchSearch && matchStatus;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: SafeArea(child: Column(children: [
          _buildHeader(),
          _buildTabs(),
          Expanded(child: _currentTab == 0 ? _buildComplaints() : _buildAnalytics()),
        ])),
      ),
    );
  }

  Widget _buildHeader() => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
    child: Row(children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('${_getGreeting()},', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 14)),
        const SizedBox(height: 2),
        ShaderMask(
          shaderCallback: (b) => const LinearGradient(colors: [Colors.white, Color(0xFFA5B4FC)]).createShader(b),
          child: Text(_userName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
        ),
      ])),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: const Color(0x26F87171), borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0x4DF87171)),
        ),
        child: const Text('ADMIN', style: TextStyle(color: Color(0xFFF87171), fontSize: 11, fontWeight: FontWeight.w600)),
      ),
      const SizedBox(width: 10),
      Container(
        decoration: BoxDecoration(gradient: AppTheme.dangerGradient, borderRadius: BorderRadius.circular(50)),
        child: Material(color: Colors.transparent, child: InkWell(
          borderRadius: BorderRadius.circular(50), onTap: _logout,
          child: const Padding(padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Text('Logout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13))),
        )),
      ),
    ]),
  );

  Widget _buildTabs() => Container(
    margin: const EdgeInsets.symmetric(horizontal: 20),
    decoration: BoxDecoration(
      color: const Color(0x0DFFFFFF), borderRadius: BorderRadius.circular(12),
      border: Border.all(color: const Color(0x1AFFFFFF)),
    ),
    child: TabBar(
      controller: _tabController,
      indicator: BoxDecoration(
        gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.circular(12),
      ),
      indicatorSize: TabBarIndicatorSize.tab,
      dividerColor: Colors.transparent,
      labelColor: Colors.white,
      unselectedLabelColor: AppTheme.textMuted,
      labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      tabs: [
        Tab(child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Icon(Icons.list_alt_rounded, size: 18), const SizedBox(width: 6),
          const Text('Complaints'), const SizedBox(width: 6),
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
            child: Text('${_complaints.length}', style: const TextStyle(fontSize: 12)),
          ),
        ])),
        const Tab(child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.analytics_rounded, size: 18), SizedBox(width: 6), Text('Analytics'),
        ])),
      ],
    ),
  );

  // ==================== COMPLAINTS TAB ====================

  Widget _buildComplaints() => Column(children: [
    _buildSearchBar(),
    Expanded(child: RefreshIndicator(
      onRefresh: _fetchComplaints, color: AppTheme.primaryPurple,
      child: _isLoading
        ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryPurple))
        : _filteredComplaints.isEmpty
          ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.search_off_rounded, size: 48, color: Colors.white.withValues(alpha: 0.2)),
              const SizedBox(height: 12),
              const Text('No complaints found', style: TextStyle(color: AppTheme.textMuted)),
            ]))
          : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _filteredComplaints.length,
              itemBuilder: (_, i) => _complaintCard(_filteredComplaints[i]),
            ),
    )),
  ]);

  Widget _buildSearchBar() => Padding(
    padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
    child: Row(children: [
      Expanded(child: Container(
        decoration: BoxDecoration(color: const Color(0x0DFFFFFF), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0x1AFFFFFF))),
        child: TextField(
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Search complaints...', border: InputBorder.none, enabledBorder: InputBorder.none, focusedBorder: InputBorder.none,
            prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.textMuted, size: 20),
            suffixIcon: _searchQuery.isNotEmpty ? IconButton(icon: const Icon(Icons.clear, color: AppTheme.textMuted, size: 18), onPressed: () => setState(() => _searchQuery = '')) : null,
            contentPadding: const EdgeInsets.symmetric(vertical: 12),
          ),
          onChanged: (v) => setState(() => _searchQuery = v),
        ),
      )),
      const SizedBox(width: 8),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(color: const Color(0x0DFFFFFF), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0x1AFFFFFF))),
        child: DropdownButtonHideUnderline(child: DropdownButton<String>(
          value: _filterStatus, dropdownColor: AppTheme.darkBg2,
          icon: const Icon(Icons.filter_list_rounded, color: AppTheme.textMuted, size: 18),
          style: const TextStyle(color: Colors.white, fontSize: 13),
          items: const [
            DropdownMenuItem(value: 'all', child: Text('All')),
            DropdownMenuItem(value: 'pending', child: Text('Pending')),
            DropdownMenuItem(value: 'in_progress', child: Text('In Progress')),
            DropdownMenuItem(value: 'resolved', child: Text('Resolved')),
          ],
          onChanged: (v) { if (v != null) setState(() => _filterStatus = v); },
        )),
      ),
    ]),
  );

  Widget _complaintCard(dynamic c) {
    final id = c['complaint_id'] as int;
    final status = c['status'] ?? 'pending';
    final fb = c['feedback'];

    return GestureDetector(
      onTap: () => _showDetailSheet(c),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: const Color(0x0DFFFFFF), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0x1AFFFFFF))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(child: Text(c['title'] ?? '', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppTheme.textWhite))),
            AppTheme.statusBadge(status),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            Text('#$id', style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 12, fontFamily: 'monospace')),
            const SizedBox(width: 12),
            if (c['category'] != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: const Color(0x268B5CF6), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0x408B5CF6))),
                child: Text(c['category'], style: const TextStyle(color: Color(0xFFC4B5FD), fontSize: 11)),
              ),
              const SizedBox(width: 8),
            ],
            AppTheme.priorityBadge(c['priority'] ?? 'medium'),
          ]),
          const SizedBox(height: 10),

          // Status Dropdown
          Row(children: [
            const Text('Update: ', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
            Expanded(child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(color: const Color(0x0DFFFFFF), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0x1AFFFFFF))),
              child: DropdownButtonHideUnderline(child: DropdownButton<String>(
                value: status, dropdownColor: AppTheme.darkBg2, isExpanded: true, isDense: true,
                icon: const Icon(Icons.arrow_drop_down, color: AppTheme.textMuted, size: 20),
                style: const TextStyle(color: Colors.white, fontSize: 13),
                items: const [
                  DropdownMenuItem(value: 'pending', child: Text('⏳ Pending')),
                  DropdownMenuItem(value: 'in_progress', child: Text('🔄 In Progress')),
                  DropdownMenuItem(value: 'resolved', child: Text('✅ Resolved')),
                ],
                onChanged: (v) { if (v != null && v != status) _updateStatus(id, v); },
              )),
            )),
          ]),

          // Feedback
          if (fb != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: const Color(0x1A34D399), borderRadius: BorderRadius.circular(8)),
              child: Row(children: [
                const Icon(Icons.feedback_rounded, size: 14, color: AppTheme.success), const SizedBox(width: 6),
                Expanded(child: Text(fb, style: const TextStyle(color: AppTheme.success, fontSize: 12))),
              ]),
            ),
          ],
        ]),
      ),
    );
  }

  void _showDetailSheet(dynamic c) {
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _DetailSheet(complaint: c, onStatusChange: _updateStatus),
    );
  }

  // ==================== ANALYTICS TAB ====================

  Widget _buildAnalytics() {
    if (_analyticsLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primaryPurple));
    }
    if (_analytics == null) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.analytics_outlined, size: 48, color: Colors.white.withValues(alpha: 0.2)),
        const SizedBox(height: 12),
        const Text('Analytics unavailable', style: TextStyle(color: AppTheme.textMuted)),
        const SizedBox(height: 16),
        AppTheme.gradientButton(label: 'Retry', onPressed: _fetchAnalytics),
      ]));
    }

    final total = _analytics!['total'] ?? 0;
    final byStatus = _analytics!['byStatus'] as Map<String, dynamic>? ?? {};
    final pending = byStatus['pending'] ?? 0;
    final inProgress = byStatus['in_progress'] ?? 0;
    final resolved = byStatus['resolved'] ?? 0;
    final avgHours = _analytics!['avgResolutionHours'];
    final resRate = total > 0 ? ((resolved / total) * 100).toStringAsFixed(1) : '0';
    final byCategory = _analytics!['byCategory'] as List<dynamic>? ?? [];

    return RefreshIndicator(
      onRefresh: _fetchAnalytics, color: AppTheme.primaryPurple,
      child: ListView(padding: const EdgeInsets.all(16), children: [
        // Stat Cards
        Row(children: [
          _statCard('Total', total, Icons.list_alt_rounded, AppTheme.primaryPurple),
          const SizedBox(width: 10),
          _statCard('Pending', pending, Icons.pending_actions_rounded, AppTheme.warning),
        ]),
        const SizedBox(height: 10),
        Row(children: [
          _statCard('In Progress', inProgress, Icons.autorenew_rounded, AppTheme.inProgressBlue),
          const SizedBox(width: 10),
          _statCard('Resolved', resolved, Icons.check_circle_outline, AppTheme.success),
        ]),
        const SizedBox(height: 16),

        // Resolution Rate & Avg Time
        Row(children: [
          Expanded(child: Container(
            padding: const EdgeInsets.all(20), decoration: AppTheme.glassCard,
            child: Column(children: [
              const Text('Resolution Rate', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              const SizedBox(height: 8),
              Text('$resRate%', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: AppTheme.success)),
            ]),
          )),
          const SizedBox(width: 10),
          Expanded(child: Container(
            padding: const EdgeInsets.all(20), decoration: AppTheme.glassCard,
            child: Column(children: [
              const Text('Avg. Resolution', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              const SizedBox(height: 8),
              Text(avgHours != null ? '${avgHours}h' : 'N/A', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: AppTheme.inProgressBlue)),
            ]),
          )),
        ]),
        const SizedBox(height: 16),

        // Status Distribution
        Container(
          padding: const EdgeInsets.all(20), decoration: AppTheme.glassCard,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Status Distribution', style: TextStyle(color: AppTheme.textMuted, fontSize: 13, fontWeight: FontWeight.w500)),
            const SizedBox(height: 14),
            if (total > 0) ...[
              ClipRRect(borderRadius: BorderRadius.circular(8), child: Row(children: [
                if (pending > 0) Expanded(flex: pending, child: Container(height: 28, color: AppTheme.warning,
                  child: Center(child: Text('$pending', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.black87))))),
                if (inProgress > 0) Expanded(flex: inProgress, child: Container(height: 28, color: AppTheme.inProgressBlue,
                  child: Center(child: Text('$inProgress', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.black87))))),
                if (resolved > 0) Expanded(flex: resolved, child: Container(height: 28, color: AppTheme.success,
                  child: Center(child: Text('$resolved', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.black87))))),
              ])),
              const SizedBox(height: 12),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                _legendDot(AppTheme.warning, 'Pending'),
                const SizedBox(width: 16),
                _legendDot(AppTheme.inProgressBlue, 'In Progress'),
                const SizedBox(width: 16),
                _legendDot(AppTheme.success, 'Resolved'),
              ]),
            ] else const Center(child: Text('No data yet', style: TextStyle(color: AppTheme.textMuted))),
          ]),
        ),
        const SizedBox(height: 16),

        // Categories
        if (byCategory.isNotEmpty) Container(
          padding: const EdgeInsets.all(20), decoration: AppTheme.glassCard,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('By Category', style: TextStyle(color: AppTheme.textMuted, fontSize: 13, fontWeight: FontWeight.w500)),
            const SizedBox(height: 14),
            ...byCategory.map((cat) {
              final maxCount = byCategory.fold<int>(0, (m, c) => (c['count'] as int) > m ? c['count'] as int : m);
              final pct = maxCount > 0 ? (cat['count'] as int) / maxCount : 0.0;
              return Padding(padding: const EdgeInsets.only(bottom: 10), child: Row(children: [
                SizedBox(width: 80, child: Text(cat['category'] ?? '', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12), textAlign: TextAlign.right)),
                const SizedBox(width: 10),
                Expanded(child: ClipRRect(borderRadius: BorderRadius.circular(6), child: LinearProgressIndicator(
                  value: pct, minHeight: 20, backgroundColor: const Color(0x0DFFFFFF),
                  valueColor: const AlwaysStoppedAnimation(AppTheme.primaryPurple),
                ))),
                const SizedBox(width: 8),
                Text('${cat['count']}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
              ]));
            }),
          ]),
        ),
        const SizedBox(height: 20),
      ]),
    );
  }

  Widget _statCard(String label, int count, IconData icon, Color color) {
    return Expanded(child: Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 8),
        Text('$count', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: color)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(color: color.withValues(alpha: 0.7), fontSize: 12, fontWeight: FontWeight.w500)),
      ]),
    ));
  }

  Widget _legendDot(Color color, String label) => Row(children: [
    Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
    const SizedBox(width: 4),
    Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
  ]);
}

// ==================== DETAIL BOTTOM SHEET ====================

class _DetailSheet extends StatelessWidget {
  final dynamic complaint;
  final Function(int, String) onStatusChange;

  const _DetailSheet({required this.complaint, required this.onStatusChange});

  @override
  Widget build(BuildContext context) {
    final id = complaint['complaint_id'] as int;
    final status = complaint['status'] ?? 'pending';

    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.75),
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [Color(0xFF1E1B37), Color(0xFF141228)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(top: BorderSide(color: Color(0x33FFFFFF))),
      ),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        // Handle
        Container(margin: const EdgeInsets.only(top: 12), width: 40, height: 4,
          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(2))),

        Flexible(child: ListView(shrinkWrap: true, padding: const EdgeInsets.all(24), children: [
          Text('#$id', style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 13, fontFamily: 'monospace')),
          const SizedBox(height: 6),
          Text(complaint['title'] ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 12),
          Wrap(spacing: 8, runSpacing: 8, children: [
            if (complaint['category'] != null) Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: const Color(0x268B5CF6), borderRadius: BorderRadius.circular(12)),
              child: Text(complaint['category'], style: const TextStyle(color: Color(0xFFC4B5FD), fontSize: 12)),
            ),
            AppTheme.priorityBadge(complaint['priority'] ?? 'medium'),
            AppTheme.statusBadge(status),
          ]),
          const SizedBox(height: 20),

          _label('Description'),
          Text(complaint['description'] ?? 'No description', style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.5)),
          const SizedBox(height: 16),

          if (complaint['created_at'] != null) ...[
            _label('Created'),
            Text(_formatDate(complaint['created_at']), style: const TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 16),
          ],

          if (complaint['feedback'] != null) ...[
            _label('Student Feedback'),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0x1A34D399), borderRadius: BorderRadius.circular(10)),
              child: Text('"${complaint['feedback']}"', style: const TextStyle(color: AppTheme.success, fontSize: 13, fontStyle: FontStyle.italic)),
            ),
            const SizedBox(height: 16),
          ],

          _label('Update Status'),
          const SizedBox(height: 6),
          Row(children: [
            _statusBtn(context, id, 'pending', '⏳', status),
            const SizedBox(width: 8),
            _statusBtn(context, id, 'in_progress', '🔄', status),
            const SizedBox(width: 8),
            _statusBtn(context, id, 'resolved', '✅', status),
          ]),
          const SizedBox(height: 20),
        ])),
      ]),
    );
  }

  Widget _label(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(text, style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
  );

  Widget _statusBtn(BuildContext context, int id, String value, String emoji, String current) {
    final isActive = current == value;
    return Expanded(child: GestureDetector(
      onTap: isActive ? null : () { onStatusChange(id, value); Navigator.pop(context); },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? const Color(0x33A5B4FC) : const Color(0x0DFFFFFF),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isActive ? const Color(0x66A5B4FC) : const Color(0x1AFFFFFF)),
        ),
        child: Center(child: Text('$emoji ${value.replaceAll('_', ' ').split(' ').map((w) => w[0].toUpperCase() + w.substring(1)).join(' ')}',
          style: TextStyle(color: isActive ? const Color(0xFFA5B4FC) : AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w500),
        )),
      ),
    ));
  }

  String _formatDate(String date) {
    try {
      final d = DateTime.parse(date);
      return '${d.day}/${d.month}/${d.year} at ${d.hour}:${d.minute.toString().padLeft(2, '0')}';
    } catch (_) { return date; }
  }
}
