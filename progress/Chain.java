import java.awt.image.ImageObserver;
import java.awt.Point;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Image;
import java.util.Vector;
import java.net.URL;
import java.applet.Applet;

//
// Decompiled by Procyon v0.5.36
//

public class Chain extends Applet implements Runnable
{
    private Thread clock;
    final int NUMATOMS = 10;
    final int ATOMWIDTH = 10;
    final int ATOMHEIGHT = 10;
    final int NUMFISSION = 4;
    final int PARTWIDTH = 1;
    final int PARTHEIGHT = 1;
    final int BSPEED = 3;
    final double PARTICLECHANCE = 0.1;
    final int DELAYFRAMES_RESET = 20;
    int appwidth;
    int appheight;
    URL url;
    boolean done;
    long delay;
    int delayframes;
    int n;
    Vector atoms;
    Vector particles;
    boolean initialized;
    Image dbuf;
    Graphics dbufG;

    public Chain() {
        this.clock = null;
        this.appwidth = 100;
        this.appheight = 100;
        this.url = null;
        this.done = false;
        this.delay = 50L;
        this.delayframes = 20;
        this.atoms = new Vector(10, 10);
        this.particles = new Vector(41, 10);
        this.initialized = false;
        this.dbuf = null;
        this.dbufG = null;
    }

    public void init() {
        this.setBackground(Color.lightGray);
        this.dbuf = this.createImage(this.appwidth, this.appheight);
        this.dbufG = this.dbuf.getGraphics();
        this.initialized = true;
        new Thread(this, "Clock").start();
        this.n = 0;
        while (this.n < 10) {
            this.newatom();
            ++this.n;
        }
    }

    public void newatom() {
        this.atoms.addElement(new Point(this.randint(this.appwidth - 10), this.randint(this.appheight - 10)));
    }

    public void newbparticle(final int n, final int n2) {
        int randint;
        int randint2;
        if (this.randint(2) == 0) {
            randint = this.randint(2) * this.appwidth;
            randint2 = this.randint(this.appheight);
        }
        else {
            randint = this.randint(this.appwidth);
            randint2 = this.randint(2) * this.appheight;
        }
        this.particles.addElement(new BParticle(n, n2, randint, randint2));
    }

    public void paint(final Graphics graphics) {
        if (this.initialized) {
            graphics.drawImage(this.dbuf, 0, 0, this);
        }
        else {
            graphics.drawString("Working...", 0, 0);
        }
    }

    int randint(final int n) {
        double random;
        for (random = 1.0; random == 1.0; random = Math.random()) {}
        return (int)(random * n);
    }

    public void run() {
        while (!this.done) {
            this.simulate();
            this.repaint();
            try {
                Thread.sleep(this.delay);
            }
            catch (InterruptedException ex) {
                System.out.println("Sleep interrupted!");
            }
        }
    }

    public void simulate() {
        if (this.initialized) {
            final Color foreground = this.getForeground();
            final Color background = this.getBackground();
            Point point = null;
            this.dbufG.setColor(background);
            this.dbufG.fillRect(0, 0, this.appwidth, this.appheight);
            this.dbufG.setColor(foreground);
            this.n = this.particles.size() - 1;
            while (this.n >= 0) {
                final BParticle bParticle = this.particles.elementAt(this.n);
                boolean b = false;
                for (int n = 0; n < 3 && !b; ++n) {
                    if (bParticle.x < 0 || bParticle.x > this.appwidth || bParticle.y < 0 || bParticle.y > this.appheight) {
                        b = true;
                        this.particles.removeElementAt(this.n);
                    }
                    else {
                        int n2;
                        for (b = false, n2 = 0; n2 < this.atoms.size() && !b; ++n2) {
                            point = (Point)this.atoms.elementAt(n2);
                            if (bParticle.x >= point.x && bParticle.x <= point.x + 10 && bParticle.y >= point.y && bParticle.y <= point.y + 10) {
                                b = true;
                            }
                        }
                        if (b) {
                            this.particles.removeElementAt(this.n);
                            this.atoms.removeElementAt(--n2);
                            for (int i = 0; i < 4; ++i) {
                                this.newbparticle(point.x, point.y);
                            }
                        }
                    }
                    if (!b) {
                        this.dbufG.fillRect(bParticle.x, bParticle.y, 1, 1);
                        bParticle.step();
                    }
                }
                --this.n;
            }
            this.n = 0;
            while (this.n < this.atoms.size()) {
                final Point point2 = this.atoms.elementAt(this.n);
                this.dbufG.setColor(background.brighter());
                this.dbufG.drawArc(point2.x, point2.y, 10, 10, 45, 360);
                this.dbufG.setColor(background.darker());
                this.dbufG.drawArc(point2.x, point2.y, 10, 10, 45, -180);
                ++this.n;
            }
            if (this.particles.isEmpty() && this.atoms.isEmpty()) {
                if (this.delayframes == 0) {
                    this.n = 0;
                    while (this.n < 10) {
                        this.newatom();
                        ++this.n;
                    }
                    this.delayframes = 20;
                }
                else {
                    --this.delayframes;
                }
            }
            else if (this.particles.isEmpty() && Math.random() < 0.1) {
                this.newbparticle(this.appwidth / 2, this.appheight / 2);
            }
        }
    }

    public void stop() {
        this.done = true;
    }

    public void update(final Graphics graphics) {
        this.paint(graphics);
    }
}
